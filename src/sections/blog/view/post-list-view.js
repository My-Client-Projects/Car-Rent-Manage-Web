'use client';

import orderBy from 'lodash/orderBy';
import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useDebounce } from 'src/hooks/use-debounce';

import { POST_SORT_OPTIONS } from 'src/_mock';
import { VEHICLE_STATUS_OPTIONS } from 'src/_mock/_vehicle';
import { useGetVehicles } from 'src/api/vehicle';
import { useSearchPosts } from 'src/api/blog';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import PostSort from '../post-sort';
import PostSearch from '../post-search';
import PostListHorizontal from '../post-list-horizontal';

// ----------------------------------------------------------------------

const defaultFilters = {
  status: 'available',
};

// ----------------------------------------------------------------------

export default function PostListView() {
  const settings = useSettingsContext();

  const [sortBy, setSortBy] = useState('latest');

  const [filters, setFilters] = useState(defaultFilters);

  const [searchQuery, setSearchQuery] = useState('');

  const debouncedQuery = useDebounce(searchQuery);

  const { vehicles, vehiclesLoading } = useGetVehicles();

  const { searchResults, searchLoading } = useSearchPosts(debouncedQuery);

  const dataFiltered = applyFilter({
    inputData: vehicles,
    filters,
    sortBy,
  });

  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSearch = useCallback((inputValue) => {
    setSearchQuery(inputValue);
  }, []);

  const handleFilterPublish = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="List"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Car',
            href: paths.dashboard.post.root,
          },
          {
            name: 'List',
          },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.post.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add New Vehicle
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Stack
        spacing={3}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <PostSearch
          query={debouncedQuery}
          results={searchResults}
          onSearch={handleSearch}
          loading={searchLoading}
          hrefItem={(id) => paths.dashboard.post.details(id)}
        />

        <PostSort sort={sortBy} onSort={handleSortBy} sortOptions={POST_SORT_OPTIONS} />
      </Stack>

      <Tabs
        value={filters.status}
        onChange={handleFilterPublish}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {VEHICLE_STATUS_OPTIONS.map((tab) => (
          <Tab
            key={tab.value}
            iconPosition="end"
            value={tab.value}
            label={tab.label}
            icon={
              <Label
                variant={(tab.value === filters.status && 'filled') || 'soft'}
                color={tab.color}
              >
                {vehicles.filter((vehicle) => vehicle.status === tab.value).length}
              </Label>
            }
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs>

      <PostListHorizontal posts={dataFiltered} loading={vehiclesLoading} />
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, filters, sortBy }) => {

  const { status  } = filters;

  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['created_at'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['created_at'], ['asc']);
  }

  if (status) {
    inputData = inputData.filter((vehicle) => vehicle.status === status);
  }

  return inputData;
};
