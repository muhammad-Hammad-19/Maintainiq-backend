// controllers/asset.controller.js

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Asset from "../models/asset.model.js";

export const createAsset = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
      });
    }

    const {
      name,
      category,
      location,
      model,
      manufacturer,
      installDate,
      warrantyExpiry,
      isCritical,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required",
      });
    }

    const uniqueQrId = uuidv4();

    const newAsset = await Asset.create({
      name,
      category,
      location,
      model,
      manufacturer,
      installDate,
      warrantyExpiry,
      isCritical,
      qrId: uniqueQrId,
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: newAsset,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllAssets = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
      });
    }

    const fetchAllAssets = await Asset.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All assets fetched successfully",
      data: fetchAllAssets,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssetByQrId = async (req, res) => {
  try {
    const { qrId } = req.params;

    if (!qrId) {
      return res.status(400).json({
        success: false,
        message: "qrId is required",
      });
    }

    const asset = await Asset.findOne({ qrId });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Asset fetched successfully",
      data: asset,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset id",
      });
    }

    // qrId aur createdBy client se update na ho sakein
    const { qrId, createdBy, ...updateData } = req.body;

    const updatedAsset = await Asset.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedAsset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      data: updatedAsset,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset id",
      });
    }

    const deletedAsset = await Asset.findByIdAndDelete(id);

    if (!deletedAsset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
      data: deletedAsset,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};