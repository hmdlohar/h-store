import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import MainLayout from '../layout/MainLayout';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from '../constants';
const TermsOfService = () => {
  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 1 }}>
        <Paper elevation={0} sx={{ p: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Terms of Service
          </Typography>
          
          <Typography variant="body1" paragraph>
            Last Updated: 2025-05-10
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to our custom products e-commerce store. These Terms of Service govern your use of our website and the purchase of custom products from us. By accessing our website or placing an order, you agree to be bound by these Terms.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            2. Custom Products
          </Typography>
          <Typography variant="body1" paragraph>
            We specialize in creating customized products tailored to your specifications. By placing an order for a custom product, you acknowledge and agree to the following:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>
              <Typography variant="body1">Each product is uniquely created based on your specifications and requirements.</Typography>
            </li>
            <li>
              <Typography variant="body1">Production begins only after your order is confirmed and payment is received.</Typography>
            </li>
            <li>
              <Typography variant="body1">Custom products may have longer production and delivery times than standard items.</Typography>
            </li>
            <li>
              <Typography variant="body1">Minor variations in color, texture, or finish may occur due to the custom nature of our products.</Typography>
            </li>
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            3. Ordering Process
          </Typography>
          <Typography variant="body1" paragraph>
            When placing an order for custom products:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>
              <Typography variant="body1">You must provide accurate and complete information regarding your custom specifications.</Typography>
            </li>
            <li>
              <Typography variant="body1">We may contact you to confirm details or request additional information before beginning production.</Typography>
            </li>
            <li>
              <Typography variant="body1">You will receive a confirmation email once your order is accepted and production begins.</Typography>
            </li>
            <li>
              <Typography variant="body1">You will be notified when your order is complete and ready for shipping.</Typography>
            </li>
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            4. Payment
          </Typography>
          <Typography variant="body1" paragraph>
            All prices are displayed in the applicable currency and are subject to change without notice. Payment must be made in full at the time of ordering. For certain large or complex custom orders, we may require a deposit or staged payments.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            5. Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>
            By submitting designs, specifications, or other content for custom products, you represent that you own or have the necessary rights to such content. You grant us a non-exclusive license to use, reproduce, and modify the content solely for the purpose of fulfilling your order.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            6. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our website or products.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            7. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            8. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our website after any changes indicates your acceptance of the modified Terms.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            9. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms, please contact us at:
          </Typography>
          <Typography variant="body1" paragraph>
            Email: {CONTACT_EMAIL}<br />
            Phone: {CONTACT_PHONE}<br />
            Address: {CONTACT_ADDRESS}
          </Typography>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default TermsOfService; 