// backend/src/controllers/addressController.js
import User from '../models/User.js';

// @desc    Get all addresses
// @route   GET /api/addresses
// @access  Private
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const addressData = req.body;
    const user = await User.findById(req.user._id);

    if (addressData.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(addressData);
    await user.save();

    const newAddress = user.addresses[user.addresses.length - 1];
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:addressId
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updates = req.body;
    
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (updates.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    Object.keys(updates).forEach(key => {
      address[key] = updates[key];
    });

    await user.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:addressId
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    
    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== addressId
    );

    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set default address
// @route   PUT /api/addresses/:addressId/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    
    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();
    
    const defaultAddress = user.addresses.find(
      addr => addr._id.toString() === addressId
    );
    
    res.json(defaultAddress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};