// controllers/report.controller.js

import { createReportService } from "../services/reportServices.js";

export const createReport = async (req, res) => {
  try {
    const { qrId, reportText } = req.body;

    if (!qrId || !reportText) {
      return res.status(400).json({
        success: false,
        message: "qrId and reportText are required",
      });
    }

    const result = await createReportService(qrId, reportText);

    if (!result.success) {
      return res.status(400).json({
        success: result.success,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
