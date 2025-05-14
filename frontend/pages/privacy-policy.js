import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import MainLayout from '../layout/MainLayout';
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS } from '../constants';
import EcomHead from '@/common/EcomHead';
const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <EcomHead title="Privacy Policy" />
      <Container maxWidth="md" sx={{ py: 1 }}>
        <Paper elevation={0} sx={{ p: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Privacy Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            Last Updated: 2025-05-10
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to our custom products e-commerce store. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            2. The Data We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect minimal personal information necessary to provide you with our custom products and services:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>
              <Typography variant="body1">Identity Data: name, username or similar identifier</Typography>
            </li>
            <li>
              <Typography variant="body1">Contact Data: billing address, delivery address, email address, phone number</Typography>
            </li>
            <li>
              <Typography variant="body1">Transaction Data: details about payments to and from you and other details of products you have purchased from us</Typography>
            </li>
            <li>
              <Typography variant="body1">Technical Data: internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform</Typography>
            </li>
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            3. How We Use Your Data
          </Typography>
          <Typography variant="body1" paragraph>
            We use your data to:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>
              <Typography variant="body1">Process and deliver your order</Typography>
            </li>
            <li>
              <Typography variant="body1">Manage payments, fees, and charges</Typography>
            </li>
            <li>
              <Typography variant="body1">Communicate with you about your order, including custom specifications</Typography>
            </li>
            <li>
              <Typography variant="body1">Improve our website, products, and services</Typography>
            </li>
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            4. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            5. Data Retention
          </Typography>
          <Typography variant="body1" paragraph>
            We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            6. Your Legal Rights
          </Typography>
          <Typography variant="body1" paragraph>
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>
              <Typography variant="body1">Request access to your personal data</Typography>
            </li>
            <li>
              <Typography variant="body1">Request correction of your personal data</Typography>
            </li>
            <li>
              <Typography variant="body1">Request erasure of your personal data</Typography>
            </li>
            <li>
              <Typography variant="body1">Object to processing of your personal data</Typography>
            </li>
            <li>
              <Typography variant="body1">Request restriction of processing your personal data</Typography>
            </li>
            <li>
              <Typography variant="body1">Request transfer of your personal data</Typography>
            </li>
            <li>
              <Typography variant="body1">Right to withdraw consent</Typography>
            </li>
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            7. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
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

export default PrivacyPolicy; 