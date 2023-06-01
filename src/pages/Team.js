import { Helmet } from 'react-helmet-async';
// @mui
import { Button, Container, Stack, Typography } from '@mui/material';
// components
import Iconify from '../components/iconify';
// mock

// ----------------------------------------------------------------------


// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Blog | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Team
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New Post
          </Button>
        </Stack>
      </Container>
    </>
  );
}
