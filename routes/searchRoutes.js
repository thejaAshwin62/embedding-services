import express from 'express';
import { search, renderSearchPage } from '../controllers/searchController.js';

const router = express.Router();

router.get('/', renderSearchPage);
router.post('/search', search);

export default router; 