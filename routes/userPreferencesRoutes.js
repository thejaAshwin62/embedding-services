import express from 'express';

import { userPreferencesService } from '../services/userPreferencesService.js';



const router = express.Router();



router.get('/:userId', async (req, res) => {

  try {

    const preferences = await userPreferencesService.getUserPreferences(req.params.userId);

    res.json(preferences);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});



router.put('/:userId', async (req, res) => {

  try {

    const preferences = await userPreferencesService.updatePreferences(

      req.params.userId,

      req.body

    );

    res.json(preferences);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});



export default router; 
