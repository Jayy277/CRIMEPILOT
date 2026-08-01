const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { Crime, User, Officer, Location, CrimeCategory } = require('../models');
const { generateReportPDF } = require('../utils/pdfGenerator');

// @desc    Get Officer Dashboard Stats
// @route   GET /api/dashboard/officer
// @access  Private (Officer, Admin)
exports.getOfficerDashboard = async (req, res) => {
  try {
    const officer = await Officer.findOne({ where: { userId: req.user.id } });
    if (!officer) {
      return res.status(404).json({ success: false, message: 'Officer profile not found' });
    }

    const totalAssigned = await Crime.count({ where: { officerId: officer.id } });

    const pendingCount = await Crime.count({
      where: {
        officerId: officer.id,
        status: { [Op.notIn]: ['Solved', 'Closed'] },
      },
    });

    const solvedCount = totalAssigned - pendingCount;

    const recentCases = await Crime.findAll({
      where: { officerId: officer.id },
      include: [
        { model: CrimeCategory, as: 'category' },
        { model: Location, as: 'location' },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      stats: {
        totalAssigned,
        pendingCount,
        solvedCount,
      },
      recentCases,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Analyst Dashboard / Aggregated Stats
// @route   GET /api/dashboard/analyst
// @access  Private (Analyst, Admin)
exports.getAnalystDashboard = async (req, res) => {
  try {
    const totalCrimes = await Crime.count();

    const solvedCount = await Crime.count({
      where: {
        status: { [Op.in]: ['Solved', 'Closed'] },
      },
    });
    const pendingCount = totalCrimes - solvedCount;

    // Category distribution using Sequelize group & count
    const categoryStatsQuery = await Crime.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('Crime.id')), 'count'],
      ],
      include: [{ model: CrimeCategory, as: 'category', attributes: ['name'] }],
      group: ['categoryId', 'category.id', 'category.name'],
      order: [[sequelize.col('count'), 'DESC']],
    });

    const categoryStats = categoryStatsQuery.map(c => ({
      _id: c.categoryId,
      count: parseInt(c.get('count')),
      name: c.category ? c.category.name : 'Unknown',
    }));

    // Hotspot stats using location relation
    const hotspotStatsQuery = await Crime.findAll({
      attributes: [
        'locationId',
        [sequelize.fn('COUNT', sequelize.col('Crime.id')), 'count'],
      ],
      include: [{ model: Location, as: 'location' }],
      group: ['locationId', 'location.id', 'location.state', 'location.district', 'location.city', 'location.policeStation'],
      order: [[sequelize.col('count'), 'DESC']],
      limit: 10,
    });

    const hotspotStats = hotspotStatsQuery.map(h => ({
      _id: h.locationId,
      count: parseInt(h.get('count')),
      state: h.location ? h.location.state : '',
      district: h.location ? h.location.district : '',
      city: h.location ? h.location.city : '',
      policeStation: h.location ? h.location.policeStation : '',
    }));

    // Monthly trends
    const monthlyTrendsQuery = await Crime.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('date')), 'year'],
        [sequelize.fn('MONTH', sequelize.col('date')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('YEAR', sequelize.col('date')), sequelize.fn('MONTH', sequelize.col('date'))],
      order: [
        [sequelize.literal('year'), 'DESC'],
        [sequelize.literal('month'), 'DESC'],
      ],
      limit: 12,
    });

    const monthlyTrends = monthlyTrendsQuery.map(m => ({
      _id: {
        year: parseInt(m.get('year')),
        month: parseInt(m.get('month')),
      },
      count: parseInt(m.get('count')),
    }));

    // Peak crime hours (based on 'time' field HH:MM)
    const hourStatsQuery = await Crime.findAll({
      attributes: [
        [sequelize.fn('SUBSTRING', sequelize.col('time'), 1, 2), 'hour'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.fn('SUBSTRING', sequelize.col('time'), 1, 2)],
      order: [[sequelize.col('count'), 'DESC']],
      limit: 5,
    });

    const hourStats = hourStatsQuery.map(h => ({
      _id: h.get('hour'),
      count: parseInt(h.get('count')),
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalCrimes,
        solvedCount,
        pendingCount,
        solvedRate: totalCrimes > 0 ? ((solvedCount / totalCrimes) * 100).toFixed(2) + '%' : '0%',
      },
      categoryStats,
      hotspotStats,
      monthlyTrends,
      hourStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });

    // Active officers count
    const activeOfficers = await Officer.count({
      include: [{ model: User, where: { role: 'officer', isActive: true } }],
    });

    const activeCases = await Crime.count({
      where: {
        status: { [Op.notIn]: ['Solved', 'Closed'] },
      },
    });

    const solvedCases = await Crime.count({
      where: {
        status: { [Op.in]: ['Solved', 'Closed'] },
      },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        activeOfficers,
        activeCases,
        solvedCases,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Generate Reports (JSON or PDF)
// @route   GET /api/dashboard/report
// @access  Private (Officer, Analyst, Admin)
exports.getReport = async (req, res) => {
  try {
    const { startDate, endDate, format, priority, status } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    if (priority) where.priority = priority;
    if (status) where.status = status;

    const crimes = await Crime.findAll({
      where,
      include: [
        { model: CrimeCategory, as: 'category' },
        { model: Location, as: 'location' },
      ],
      order: [['date', 'DESC']],
    });

    const periodStr = (startDate || 'Beginning') + ' to ' + (endDate || 'Present');

    if (format === 'pdf') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const filename = `CrimePilot_Report_${year}-${month}-${day}_${hours}-${minutes}.pdf`;

      res.attachment(filename);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      return generateReportPDF(
        res,
        'Crime Cases Compilation Report',
        `Generated from filter criteria. Total cases matched: ${crimes.length}`,
        crimes,
        periodStr
      );
    }

    res.status(200).json({
      success: true,
      period: periodStr,
      count: crimes.length,
      crimes,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
