import { Router } from 'express';
import { leadController } from '../controllers/LeadController';

/**
 * Lead Routes
 *
 * Defines all lead-related API endpoints.
 * Controller handles request/response logic.
 */
const router = Router();

// Lead management
router.post('/', (req, res) => leadController.createLead(req, res));
router.get('/:id', (req, res) => leadController.getLeadTimeline(req, res));

// Message operations
router.post('/send', (req, res) => leadController.sendMessage(req, res));
router.post('/reply', (req, res) => leadController.handleReply(req, res));

// AI operations
router.post('/ai/reply', (req, res) => leadController.generateAIReply(req, res));

export default router;
