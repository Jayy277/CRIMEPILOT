const { Op } = require('sequelize');
const { Crime, User, Officer, Location, Suspect, Notification, CrimeCategory, CrimeNote, CrimeSelectedSection } = require('../models');

// Status Progression Order
const STATUS_ORDER = ['Reported', 'Assigned', 'Under Investigation', 'Evidence Collected', 'Solved', 'Closed'];

// Helper to create notifications
const createNotification = async (type, recipientId, message) => {
  try {
    await Notification.create({ type, recipientId, message });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

// @desc    Register a new crime case
// @route   POST /api/crimes
// @access  Private (Officer, Admin)
exports.registerCrime = async (req, res) => {
  try {
    console.log('registerCrime request body:', req.body);
    const { crimeCategory, date, time, location, description, officer, priority, sections } = req.body;
    const categoryId = Number(crimeCategory) || crimeCategory;
    const officerId = Number(officer) || officer;
    const locationId = Number(location) || location;

    // Verify officer exists
    const officerExists = await Officer.findByPk(officerId, {
      include: [{ model: User }],
    });
    if (!officerExists) {
      return res.status(404).json({ success: false, message: 'Officer not found' });
    }

    // Verify location exists
    const locationExists = await Location.findByPk(locationId);
    if (!locationExists) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    // Create crime case
    const crime = await Crime.create({
      categoryId,
      date,
      time,
      locationId,
      description,
      officerId,
      priority: priority || 'Medium',
      status: 'Reported',
    });

    // Create assigned sections if provided
    if (sections && Array.isArray(sections)) {
      for (const sec of sections) {
        await CrimeSelectedSection.create({
          crimeId: crime.id,
          act: sec.act,
          section: sec.section,
          description: sec.description,
        });
      }
    }

    // 1. Notify Assigned Officer (New Case Assigned)
    if (officerExists.User) {
      await createNotification(
        'New Case Assigned',
        officerExists.User.id,
        `You have been assigned to Case: ${crime.crimeId} (${description.substring(0, 40)}...)`
      );
    }

    // 2. Notify Admins and Assigned Officer if High/Critical Priority
    if (priority === 'High' || priority === 'Critical') {
      const admins = await User.findAll({ where: { role: 'admin' } });
      const adminPromises = admins.map(admin =>
        createNotification(
          'High Priority Alert',
          admin.id,
          `High Priority Case Created: ${crime.crimeId} assigned to officer ${officerExists.badgeNo}`
        )
      );
      await Promise.all(adminPromises);
    }

    res.status(201).json({ success: true, crime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all crimes (with search, filters)
// @route   GET /api/crimes
// @access  Private (Officer, Analyst, Admin)
exports.getCrimes = async (req, res) => {
  try {
    const { crimeId, crimeCategory, location, priority, status, suspectName, search } = req.query;
    const where = {};

    // Exact matching filters
    if (crimeId) where.crimeId = { [Op.like]: `%${crimeId}%` };
    if (crimeCategory) where.categoryId = crimeCategory;
    if (location) where.locationId = location;
    if (priority) where.priority = priority;
    if (status) where.status = status;

    // Search query matches description
    if (search) {
      where.description = { [Op.like]: `%${search}%` };
    }

    // Suspect name filtering
    if (suspectName) {
      const matchingSuspects = await Suspect.findAll({
        where: { name: { [Op.like]: `%${suspectName}%` } },
      });
      const crimeIds = matchingSuspects.map(s => s.linkedCrimeId);
      where.id = { [Op.in]: crimeIds };
    }

    // Role-based scoping for officers
    if (req.user.role === 'officer' && req.query.assignedOnly === 'true') {
      const officer = await Officer.findOne({ where: { userId: req.user.id } });
      if (officer) {
        where.officerId = officer.id;
      }
    }

    const crimes = await Crime.findAll({
      where,
      include: [
        { model: CrimeCategory, as: 'category' },
        { model: Location, as: 'location' },
        {
          model: Officer,
          as: 'officer',
          include: [{ model: User, attributes: ['name', 'email'] }],
        },
        { model: CrimeSelectedSection, as: 'sections' },
        { model: CrimeNote, as: 'notes' },
      ],
      order: [['createdAt', 'DESC']],
    });

    const formattedCrimes = crimes.map(c => {
      const data = c.toJSON ? c.toJSON() : { ...c };
      data._id = data.id;
      data.isPending = data.status !== 'Solved' && data.status !== 'Closed';
      if (data.category) data.category._id = data.category.id;
      if (data.location) data.location._id = data.location.id;
      if (data.officer) {
        data.officer._id = data.officer.id;
        data.officer.user = data.officer.User || data.officer.user;
        if (data.officer.user) data.officer.user._id = data.officer.user.id;
      }
      return data;
    });

    res.status(200).json({ success: true, count: crimes.length, crimes: formattedCrimes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get pending cases (Custom Feature B)
// @route   GET /api/crimes/pending
// @access  Private (Officer, Analyst, Admin)
exports.getPendingCrimes = async (req, res) => {
  try {
    const pendingCrimes = await Crime.findAll({
      where: {
        status: { [Op.notIn]: ['Solved', 'Closed'] },
      },
      include: [
        { model: CrimeCategory, as: 'category' },
        { model: Location, as: 'location' },
        {
          model: Officer,
          as: 'officer',
          include: [{ model: User, attributes: ['name', 'email'] }],
        },
        { model: CrimeSelectedSection, as: 'sections' },
        { model: CrimeNote, as: 'notes' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: pendingCrimes.length,
      crimes: pendingCrimes,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get crime by ID
// @route   GET /api/crimes/:id
// @access  Private (Officer, Analyst, Admin)
exports.getCrimeById = async (req, res) => {
  try {
    const crime = await Crime.findByPk(req.params.id, {
      include: [
        { model: CrimeCategory, as: 'category' },
        { model: Location, as: 'location' },
        {
          model: Officer,
          as: 'officer',
          include: [{ model: User, attributes: ['name', 'email'] }],
        },
        {
          model: CrimeNote,
          as: 'notes',
          include: [{ model: User, as: 'addedBy', attributes: ['name', 'email', 'role'] }],
        },
        { model: CrimeSelectedSection, as: 'sections' },
      ],
    });

    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }

    res.status(200).json({ success: true, crime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update crime details (excluding status flow)
// @route   PUT /api/crimes/:id
// @access  Private (Officer, Admin)
exports.updateCrime = async (req, res) => {
  try {
    const { crimeCategory, date, time, location, description, officer, priority, sections } = req.body;
    const crime = await Crime.findByPk(req.params.id);

    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }

    // Verify user authorization
    if (req.user.role === 'officer') {
      const officerRecord = await Officer.findOne({ where: { userId: req.user.id } });
      if (!officerRecord || crime.officerId !== officerRecord.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized. You can only edit cases assigned to you.' });
      }
    }

    if (crimeCategory) crime.categoryId = crimeCategory;
    if (date) crime.date = date;
    if (time) crime.time = time;
    if (location) crime.locationId = location;
    if (description) crime.description = description;
    if (officer) {
      const officerExists = await Officer.findByPk(officer);
      if (!officerExists) {
        return res.status(404).json({ success: false, message: 'New assigned officer not found' });
      }
      if (crime.officerId !== officer) {
        const oldOfficer = await Officer.findByPk(crime.officerId, { include: [User] });
        if (oldOfficer && oldOfficer.User) {
          await createNotification('New Case Assigned', oldOfficer.User.id, `You have been unassigned from Case: ${crime.crimeId}`);
        }
        crime.officerId = officer;
        const newOfficerUser = await Officer.findByPk(officer, { include: [User] });
        if (newOfficerUser && newOfficerUser.User) {
          await createNotification('New Case Assigned', newOfficerUser.User.id, `You have been assigned to Case: ${crime.crimeId}`);
        }
      }
    }
    if (priority) crime.priority = priority;

    // Update sections if provided
    if (sections && Array.isArray(sections)) {
      await CrimeSelectedSection.destroy({ where: { crimeId: crime.id } });
      for (const sec of sections) {
        await CrimeSelectedSection.create({
          crimeId: crime.id,
          act: sec.act,
          section: sec.section,
          description: sec.description,
        });
      }
    }

    await crime.save();
    res.status(200).json({ success: true, crime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update crime status strictly following sequential flow
// @route   PATCH /api/crimes/:id/status
// @access  Private (Officer, Admin)
exports.updateCrimeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const crime = await Crime.findByPk(req.params.id);

    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }

    // Verify authorization
    if (req.user.role === 'officer') {
      const officerRecord = await Officer.findOne({ where: { userId: req.user.id } });
      if (!officerRecord || crime.officerId !== officerRecord.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized. You can only update status for your assigned cases.' });
      }
    }

    const currentIndex = STATUS_ORDER.indexOf(crime.status);
    const targetIndex = STATUS_ORDER.indexOf(status);

    if (targetIndex === -1) {
      return res.status(400).json({ success: false, message: `Invalid status. Choose from: ${STATUS_ORDER.join(', ')}` });
    }

    if (targetIndex !== currentIndex && targetIndex !== currentIndex + 1) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${crime.status}' to '${status}'. Status must strictly follow the progression flow: ${STATUS_ORDER.join(' → ')}`,
      });
    }

    crime.status = status;
    await crime.save();

    const officerRecord = await Officer.findByPk(crime.officerId, { include: [User] });
    if (officerRecord && officerRecord.User) {
      await createNotification(
        'New Case Assigned',
        officerRecord.User.id,
        `Status of Case ${crime.crimeId} updated to: ${status}`
      );
    }

    // Virtual getter replacement logic: check if status Solved/Closed
    const isPendingVal = status !== 'Solved' && status !== 'Closed';

    res.status(200).json({ success: true, status: crime.status, isPending: isPendingVal, crime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Close or mark crime as Solved/Closed directly
// @route   PATCH /api/crimes/:id/close-solved
// @access  Private (Officer, Admin)
exports.closeOrSolveCrime = async (req, res) => {
  try {
    const { status } = req.body;
    const crime = await Crime.findByPk(req.params.id);

    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }

    if (!['Solved', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be either Solved or Closed' });
    }

    if (req.user.role === 'officer') {
      const officerRecord = await Officer.findOne({ where: { userId: req.user.id } });
      if (!officerRecord || crime.officerId !== officerRecord.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }

    crime.status = status;
    await crime.save();

    res.status(200).json({ success: true, message: `Case successfully marked as ${status}`, crime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add notes / timeline updates to a case
// @route   POST /api/crimes/:id/notes
// @access  Private (Officer, Analyst, Admin)
exports.addCrimeNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }

    const crime = await Crime.findByPk(req.params.id);
    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }

    const newNote = await CrimeNote.create({
      crimeId: crime.id,
      note,
      addedById: req.user.id,
    });

    const notes = await CrimeNote.findAll({ where: { crimeId: crime.id } });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a crime (Admin-only)
// @route   DELETE /api/crimes/:id
// @access  Private (Admin)
exports.deleteCrime = async (req, res) => {
  try {
    const crime = await Crime.findByPk(req.params.id);
    if (!crime) {
      return res.status(404).json({ success: false, message: 'Crime case not found' });
    }
    await crime.destroy();
    res.status(200).json({ success: true, message: 'Crime case deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Custom Feature C: Find similar/related past cases
// @route   GET /api/crimes/:id/similar
// @access  Private (Officer, Analyst, Admin)
exports.findSimilarCrimes = async (req, res) => {
  try {
    const sourceCrime = await Crime.findByPk(req.params.id, {
      include: [
        { model: CrimeCategory, as: 'category' },
        { model: Location, as: 'location' },
      ],
    });

    if (!sourceCrime) {
      return res.status(404).json({ success: false, message: 'Source crime case not found' });
    }

    const otherCrimes = await Crime.findAll({
      where: { id: { [Op.ne]: sourceCrime.id } },
      include: [
        { model: CrimeCategory, as: 'category' },
        { model: Location, as: 'location' },
      ],
    });

    const stopWords = new Set(['the', 'and', 'a', 'of', 'in', 'on', 'at', 'with', 'for', 'by', 'an', 'to', 'was', 'were', 'had', 'been', 'is', 'are']);
    const sourceKeywords = sourceCrime.description
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w));

    const rankedCases = otherCrimes.map(targetCrime => {
      let score = 0;
      const reasons = [];

      if (targetCrime.categoryId === sourceCrime.categoryId) {
        score += 5;
        reasons.push(`Same crime type (${sourceCrime.category.name})`);
      }

      if (targetCrime.location && sourceCrime.location) {
        if (targetCrime.location.policeStation.toLowerCase() === sourceCrime.location.policeStation.toLowerCase()) {
          score += 4;
          reasons.push(`Same police station jurisdiction (${sourceCrime.location.policeStation})`);
        } else if (targetCrime.location.city.toLowerCase() === sourceCrime.location.city.toLowerCase()) {
          score += 3;
          reasons.push(`Same city (${sourceCrime.location.city})`);
        }
      }

      const daysDiff = Math.abs((new Date(targetCrime.date) - new Date(sourceCrime.date)) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 30) {
        score += 3;
        reasons.push(`Date proximity within 30 days (${Math.round(daysDiff)} days apart)`);
      } else if (daysDiff <= 90) {
        score += 1;
        reasons.push(`Date proximity within 90 days (${Math.round(daysDiff)} days apart)`);
      }

      const targetDescLower = targetCrime.description.toLowerCase();
      let matchedWordCount = 0;
      const matchedWords = [];

      for (const word of sourceKeywords) {
        if (targetDescLower.includes(word)) {
          matchedWordCount++;
          matchedWords.push(word);
          if (matchedWordCount <= 4) {
            score += 1;
          }
        }
      }

      if (matchedWordCount > 0) {
        reasons.push(`Similar details matching keywords: ${matchedWords.slice(0, 3).join(', ')}`);
      }

      return {
        crime: targetCrime,
        similarityScore: score,
        similarityReasons: reasons,
      };
    })
    .filter(item => item.similarityScore > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 10);

    res.status(200).json({
      success: true,
      count: rankedCases.length,
      results: rankedCases,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
