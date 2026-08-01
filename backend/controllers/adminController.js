const { Op } = require('sequelize');
const { User, Officer, Analyst, Location, CrimeCategory, CrimeCategorySection, AuditLog, Crime } = require('../models');

// ==========================================
// 1. CRIME CATEGORIES MANAGEMENT
// ==========================================

// Create Crime Category
exports.createCategory = async (req, res) => {
  try {
    const { name, sections } = req.body;
    const categoryExists = await CrimeCategory.findOne({ where: { name } });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await CrimeCategory.create({ name });

    if (sections && Array.isArray(sections)) {
      for (const sec of sections) {
        await CrimeCategorySection.create({
          categoryId: category.id,
          act: sec.act,
          section: sec.section,
          description: sec.description,
        });
      }
    }

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all Crime Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await CrimeCategory.findAll({
      include: [{ model: CrimeCategorySection, as: 'sections' }],
      order: [['name', 'ASC']],
    });
    const normalizedCategories = categories.map((cat) => {
      const data = cat.toJSON ? cat.toJSON() : { ...cat };
      data._id = data.id;
      if (Array.isArray(data.sections)) {
        data.sections = data.sections.map((section) => {
          const secData = section.toJSON ? section.toJSON() : { ...section };
          secData._id = secData.id;
          return secData;
        });
      }
      return data;
    });
    res.status(200).json({ success: true, categories: normalizedCategories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Crime Category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await CrimeCategory.findByPk(req.params.id, {
      include: [{ model: CrimeCategorySection, as: 'sections' }],
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Crime Category
exports.updateCategory = async (req, res) => {
  try {
    const { name, sections } = req.body;
    const category = await CrimeCategory.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) category.name = name;
    await category.save();

    if (sections && Array.isArray(sections)) {
      await CrimeCategorySection.destroy({ where: { categoryId: category.id } });
      for (const sec of sections) {
        await CrimeCategorySection.create({
          categoryId: category.id,
          act: sec.act,
          section: sec.section,
          description: sec.description,
        });
      }
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Crime Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await CrimeCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    await category.destroy();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Custom Feature A helper: Get legal sections
exports.getCategorySections = async (req, res) => {
  try {
    const sections = await CrimeCategorySection.findAll({
      where: { categoryId: req.params.id },
    });
    res.status(200).json({ success: true, count: sections.length, sections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. LOCATIONS MANAGEMENT
// ==========================================

// Create Location
exports.createLocation = async (req, res) => {
  try {
    const { state, district, city, policeStation } = req.body;
    const locationExists = await Location.findOne({
      where: { state, district, city, policeStation },
    });
    if (locationExists) {
      return res.status(400).json({ success: false, message: 'Location/Police Station already exists' });
    }
    const location = await Location.create({ state, district, city, policeStation });
    res.status(201).json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all Locations
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({
      order: [['policeStation', 'ASC']],
    });
    const formattedLocations = locations.map(loc => {
      const data = loc.toJSON();
      data._id = loc.id;
      return data;
    });
    res.status(200).json({ success: true, locations: formattedLocations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Location by ID
exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.status(200).json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Location
exports.updateLocation = async (req, res) => {
  try {
    const { state, district, city, policeStation } = req.body;
    const location = await Location.findByPk(req.params.id);

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    if (state) location.state = state;
    if (district) location.district = district;
    if (city) location.city = city;
    if (policeStation) location.policeStation = policeStation;

    await location.save();
    res.status(200).json({ success: true, location });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Location
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    // Check for active cases (status not in 'Solved', 'Closed')
    const activeCasesCount = await Crime.count({
      where: {
        locationId: id,
        status: { [Op.notIn]: ['Solved', 'Closed'] }
      }
    });

    if (activeCasesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot remove this station.\n${activeCasesCount} active cases are currently assigned.`
      });
    }

    // No active cases: deactivate the station
    location.isActive = false;
    await location.save();

    res.status(200).json({
      success: true,
      message: 'Station deactivated successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 3. USER MANAGEMENT (OFFICER & ANALYST)
// ==========================================

// Get all Users (Officers and Analysts lists)
exports.getUsers = async (req, res) => {
  try {
    const { role, name, badgeNo, department } = req.query;

    const userFilters = {};
    if (name) userFilters.name = { [Op.like]: `%${name}%` };

    if (role) {
      userFilters.role = role;
    } else {
      userFilters.role = { [Op.in]: ['officer', 'analyst'] };
    }

    const matchedUsers = await User.findAll({ where: userFilters });
    const userIds = matchedUsers.map(u => u.id);

    let officerResults = [];
    let analystResults = [];

    if (!role || role === 'officer') {
      const officerQuery = { userId: { [Op.in]: userIds } };
      if (badgeNo) officerQuery.badgeNo = { [Op.like]: `%${badgeNo}%` };

      officerResults = await Officer.findAll({
        where: officerQuery,
        include: [
          { model: User, attributes: ['id', 'name', 'email', 'role', 'isActive'] },
          { model: Location, as: 'station' },
        ],
      });
    }

    if (!role || role === 'analyst') {
      const analystQuery = { userId: { [Op.in]: userIds } };
      if (department) analystQuery.department = { [Op.like]: `%${department}%` };

      analystResults = await Analyst.findAll({
        where: analystQuery,
        include: [
          { model: User, attributes: ['id', 'name', 'email', 'role', 'isActive'] },
        ],
      });
    }

    const formattedOfficers = officerResults.map(o => {
      const data = o.toJSON ? o.toJSON() : { ...o };
      data._id = data.id;
      data.user = data.User || data.user;
      if (data.user) {
        data.user._id = data.user.id;
      }
      if (data.station) {
        data.station._id = data.station.id;
      }
      return data;
    });

    const formattedAnalysts = analystResults.map(a => {
      const data = a.toJSON ? a.toJSON() : { ...a };
      data._id = data.id;
      data.user = data.User || data.user;
      if (data.user) {
        data.user._id = data.user.id;
      }
      return data;
    });

    res.status(200).json({
      success: true,
      officers: formattedOfficers,
      analysts: formattedAnalysts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Search Staff (alias for getUsers)
exports.searchStaff = exports.getUsers;

// Update User details & subprofile
exports.updateUser = async (req, res) => {
  try {
    const { name, email, isActive, role, badgeNo, station, contact, department } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;

    const oldRole = user.role;
    if (role && role !== oldRole) {
      // Role changed — delete old subprofile
      if (oldRole === 'officer') await Officer.destroy({ where: { userId: user.id } });
      if (oldRole === 'analyst') await Analyst.destroy({ where: { userId: user.id } });

      user.role = role;

      // Create new subprofile
      if (role === 'officer') {
        await Officer.create({
          userId: user.id,
          badgeNo: badgeNo || `BADGE-${Date.now()}`,
          stationId: station,
          contact: contact || 'N/A',
        });
      } else if (role === 'analyst') {
        await Analyst.create({
          userId: user.id,
          department: department || 'General Analytics',
        });
      }
    } else {
      // Role did not change — update existing subprofile
      if (user.role === 'officer') {
        const officer = await Officer.findOne({ where: { userId: user.id } });
        if (officer) {
          if (badgeNo) officer.badgeNo = badgeNo;
          if (station) officer.stationId = station;
          if (contact) officer.contact = contact;
          await officer.save();
        }
      } else if (user.role === 'analyst') {
        const analyst = await Analyst.findOne({ where: { userId: user.id } });
        if (analyst) {
          if (department) analyst.department = department;
          await analyst.save();
        }
      }
    }

    await user.save();

    let details = null;
    if (user.role === 'officer') {
      details = await Officer.findOne({
        where: { userId: user.id },
        include: [{ model: Location, as: 'station' }],
      });
    } else if (user.role === 'analyst') {
      details = await Analyst.findOne({ where: { userId: user.id } });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      details,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle User status
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot activate/deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete User Profile and Record
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // subprofile rows have foreign keys with Cascade Delete configured in MySQL migrations,
    // but doing explicit destroy here guarantees cleanup.
    if (user.role === 'officer') await Officer.destroy({ where: { userId: user.id } });
    if (user.role === 'analyst') await Analyst.destroy({ where: { userId: user.id } });

    await user.destroy();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update User status (legacy compat)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status successfully updated to ${isActive ? 'Active' : 'Deactivated'}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 4. SYSTEM AUDIT LOGS
// ==========================================

// Get System Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'role'] }],
      order: [['timestamp', 'DESC']],
      limit: 100,
    });

    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
