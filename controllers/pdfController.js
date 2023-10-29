import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnAuthenticatedError } from '../errors/index.js';
import PDF from '../models/PDF.js';
import PDFEducation from '../models/PDFEducation.js';

const createPDF = async (req, res) => {
  const { year, age, reasonAllDeathCount, reasonvalue } = req.body;

  const currentDate = new Date();
  const yearjs = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const amPm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = String(hours % 12 || 12).padStart(2, '0');

  const GenratedDate = `${yearjs}-${month}-${day}  ${formattedHours}:${minutes} ${amPm} `;

  if (!year || !age || !reasonAllDeathCount || !reasonvalue || !GenratedDate) {
    throw new BadRequestError('Please provide all values');
  }

  req.body.createdBy = req.user.userId;
  req.body.GenratedDate = GenratedDate;
  const pdf = await PDF.create(req.body);
  res.status(StatusCodes.CREATED).json({ pdf });
};

const getPDF = async (req, res) => {
  const { search, type, sort } = req.query;

  const reasonMap = {
    'Economic Problems': 1,
    'Employment Problems': 2,
    'Problems Caused With The Elders': 3,
    Harrasment: 4,
    'Love Affairs': 5,
    'Sexual Harrassment': 6,
    Drugs: 7,
    'Aggrieved Over The Death Parents': 8,
    'Loss Of Property': 9,
    'Failure At The Examination': 10,
    'Mental disorders': 11,
    'Chronic Diseases Physical Disabilities': 12,
    'Other Reasons': 13,
    all: 14,
  };

  const searchNumber = reasonMap[search];

  const queryObject = {
    recruiterID: req.user.userId,
  };
  if (type !== 'all') {
    queryObject.type = type;
  }
  if (searchNumber && searchNumber != 14) {
    queryObject.reasonvalue = { $regex: searchNumber, $options: 'i' };
  }
  //No AWAIT
  let result = PDF.find(queryObject);
  //chain sort conditions
  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  const pdfCount = await PDF.countDocuments(queryObject);
  const pdfsNumOfPages = Math.ceil(pdfCount / limit);

  const pdfs = await result;
  //Response
  return res.status(StatusCodes.OK).send({
    pdfs,
    pdfCount,
    pdfsNumOfPages,
  });
};

const createPDFEdu = async (req, res) => {
  const { year, age, educationAllDeathCount, education } = req.body;

  const currentDate = new Date();
  const yearjs = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const amPm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = String(hours % 12 || 12).padStart(2, '0');

  const GenratedDate = `${yearjs}-${month}-${day}  ${formattedHours}:${minutes} ${amPm} `;

  if (!year || !age || !educationAllDeathCount || !education || !GenratedDate) {
    throw new BadRequestError('Please provide all values');
  }

  req.body.createdBy = req.user.userId;
  req.body.GenratedDate = GenratedDate;

  const pdf = await PDFEducation.create(req.body);
  res.status(StatusCodes.CREATED).json({ pdf });
};

const getPDFEdu = async (req, res) => {
  const { search, type, sort } = req.query;

  const queryObject = {
    recruiterID: req.user.userId,
  };
  if (type !== 'all') {
    queryObject.type = type;
  }
  if (search && search != 'all') {
    queryObject.education = { $regex: search, $options: 'i' };
  }
  //No AWAIT
  let result = PDFEducation.find(queryObject);
  //chain sort conditions
  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  const pdfCountEDU = await PDFEducation.countDocuments(queryObject);
  const pdfsNumOfPagesEDU = Math.ceil(pdfCountEDU / limit);

  const pdfsEDU = await result;
  //Response
  return res.status(StatusCodes.OK).send({
    pdfsEDU,
    pdfCountEDU,
    pdfsNumOfPagesEDU,
  });
};

const deletePDF = async (req, res) => {
  const { id: id } = req.params;
  const pdf = await PDF.findOne({ _id: id });
  if (!pdf) {
    throw new NotFoundError();
  }
  //check permissions

  await pdf.remove();
  return res.status(StatusCodes.OK).send({ msg: 'Success! pdf Removed' });
};

const deleteEduPDF = async (req, res) => {
  const { id: id } = req.params;
  const pdf = await PDFEducation.findOne({ _id: id });
  if (!pdf) {
    throw new NotFoundError();
  }
  //check permissions

  await pdf.remove();
  return res.status(StatusCodes.OK).send({ msg: 'Success! pdf Removed' });
};

export { createPDF, getPDF, createPDFEdu, getPDFEdu, deletePDF, deleteEduPDF };
