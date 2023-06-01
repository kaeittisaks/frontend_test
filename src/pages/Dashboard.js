import { Helmet } from 'react-helmet-async';
// @mui

import { Container, Typography } from '@mui/material';
// components
// sections
// ----------------------------------------------------------------------

export default function DashboardAppPage() {
 

  return (
    <>
      <Helmet>
        <title> Dashboard | Minimal UI </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
        Dashboard
        </Typography>

       
      </Container>
    </>
  );
}
