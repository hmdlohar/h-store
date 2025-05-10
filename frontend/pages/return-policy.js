import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import MainLayout from '../layout/MainLayout';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from '../constants';
const ReturnPolicy = () => {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 1 }}>
        <Paper elevation={0} sx={{ p: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Return & Refund Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            Last Updated: 2025-05-10
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            1. Custom Products Policy
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            Due to the customized nature of our products, all sales are generally final. Each item is specially made to your specifications, which makes returns and refunds extremely limited.
          </Typography>
          <Typography variant="body1" paragraph>
            We take great care to create each custom product according to your specifications. Before production begins, we ensure that all details are confirmed and approved by you. This helps minimize any potential issues with your order.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            2. Quality Guarantee
          </Typography>
          <Typography variant="body1" paragraph>
            We stand behind the quality of our work. If your custom product arrives with manufacturing defects or significant deviations from the approved specifications, please contact us within 48 hours of receiving your order. Please include:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>
              <Typography variant="body1">Order number</Typography>
            </li>
            <li>
              <Typography variant="body1">Detailed description of the issue</Typography>
            </li>
            <li>
              <Typography variant="body1">Clear photos showing the defect or deviation</Typography>
            </li>
          </Typography>
          <Typography variant="body1" paragraph>
            We will review your claim and, at our discretion, offer one of the following remedies:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>
              <Typography variant="body1">Repair of the item (if possible)</Typography>
            </li>
            <li>
              <Typography variant="body1">Partial refund</Typography>
            </li>
            <li>
              <Typography variant="body1">Remake of the item (for significant defects)</Typography>
            </li>
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            3. Exceptions and Special Circumstances
          </Typography>
          <Typography variant="body1" paragraph>
            We understand that special circumstances may arise. If you are experiencing an issue with your custom order that falls outside our standard policy, please contact our customer service team. While we cannot guarantee a refund or return for custom products, we will review each situation on a case-by-case basis and work with you to find a reasonable solution.
          </Typography>
          <Typography variant="body1" paragraph>
            The final decision regarding any exceptions to our return policy rests solely with our management team.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            4. Cancellation Policy
          </Typography>
          <Typography variant="body1" paragraph>
            Due to the custom nature of our products:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>
              <Typography variant="body1">Orders may be cancelled with full refund only before production begins.</Typography>
            </li>
            <li>
              <Typography variant="body1">Once production has started, cancellations will incur a fee based on the stage of production.</Typography>
            </li>
            <li>
              <Typography variant="body1">Orders that have been completed cannot be cancelled.</Typography>
            </li>
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            5. Contact for Returns or Refunds
          </Typography>
          <Typography variant="body1" paragraph>
            If you believe your situation warrants consideration for a return or refund, please contact our customer service team at:
          </Typography>
          <Typography variant="body1" paragraph>
            Email: {CONTACT_EMAIL}<br />
            Phone: {CONTACT_PHONE}<br />
            Address: {CONTACT_ADDRESS}
          </Typography>
          <Typography variant="body1" paragraph>
            Please include your order number and a detailed explanation of your request. Our team will review your case and respond within 2-3 business days.
          </Typography>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default ReturnPolicy; 