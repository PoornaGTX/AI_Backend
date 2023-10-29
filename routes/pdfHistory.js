import express from "express";

const router = express.Router();

import {
  createPDF,
  getPDF,
  createPDFEdu,
  getPDFEdu,
} from "../controllers/pdfController.js";

router.route("/").post(createPDF).get(getPDF);
router.route("/edu").post(createPDFEdu).get(getPDFEdu);

export default router;
