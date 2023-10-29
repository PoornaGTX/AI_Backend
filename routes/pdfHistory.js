import express from 'express';

const router = express.Router();

import { createPDF, getPDF, createPDFEdu, getPDFEdu, deletePDF, deleteEduPDF } from '../controllers/pdfController.js';

router.route('/').post(createPDF).get(getPDF);
router.route('/pdfdelete/:id').delete(deletePDF);
router.route('/pdfedudelete/:id').delete(deleteEduPDF);
router.route('/edu').post(createPDFEdu).get(getPDFEdu);

export default router;
