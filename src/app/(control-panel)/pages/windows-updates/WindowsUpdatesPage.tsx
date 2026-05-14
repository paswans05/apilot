import { useState, useEffect, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import wingetService, { WingetPackage } from 'src/app/services/wingetService';
import _ from 'lodash';

function WindowsUpdatesPage() {
	const [packages, setPackages] = useState<WingetPackage[]>([]);
	const [loading, setLoading] = useState(true);
	const [upgrading, setUpgrading] = useState<string | null>(null);
	const [searchText, setSearchText] = useState('');
	const [order, setOrder] = useState<'asc' | 'desc'>('asc');
	const [orderBy, setOrderBy] = useState<keyof WingetPackage>('name');

	const fetchPackages = async () => {
		setLoading(true);
		const data = await wingetService.list();
		setPackages(data);
		setLoading(false);
	};

	useEffect(() => {
		fetchPackages();
	}, []);

	const handleRequestSort = (property: keyof WingetPackage) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(event.target.value);
	};

	const filteredAndSortedPackages = useMemo(() => {
		let result = [...packages];

		// Filter
		if (searchText) {
			result = result.filter((pkg) =>
				Object.values(pkg).some((val) =>
					val?.toString().toLowerCase().includes(searchText.toLowerCase())
				)
			);
		}

		// Sort
		result = _.orderBy(result, [orderBy], [order]);

		return result;
	}, [packages, searchText, order, orderBy]);

	const handleUpgrade = async (id: string) => {
		setUpgrading(id);
		const result = await wingetService.upgrade(id);
		if (result.success) {
			await fetchPackages();
		} else {
			alert('Upgrade failed: ' + result.error);
		}
		setUpgrading(null);
	};

	if (loading) {
		return <FuseLoading />;
	}

	return (
		<div className="p-4 sm:p-4">

			<TableContainer component={Paper} className="rounded-xl shadow-sm border-1 border-solid overflow-hidden">
				<Box className="flex flex-col sm:flex-row items-end justify-end p-2 gap-2">

					<div className="flex items-center gap-2 w-full sm:w-auto">
						<TextField
							label="Search Software"
							variant="outlined"
							size="small"
							value={searchText}
							onChange={handleSearchChange}
							className="flex-auto sm:w-100"
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<FuseSvgIcon size={20}>heroicons-outline:magnifying-glass</FuseSvgIcon>
										</InputAdornment>
									)
								}
							}}
						/>
						<Button
							variant="contained"
							color="secondary"
							onClick={fetchPackages}
							startIcon={<FuseSvgIcon>heroicons-outline:arrow-path</FuseSvgIcon>}
						>
							Refresh
						</Button>
					</div>
				</Box>

				<Table aria-label="winget software table" stickyHeader>
					<TableHead className="bg-gray-50">
						<TableRow>
							<TableCell>
								<TableSortLabel
									active={orderBy === 'name'}
									direction={orderBy === 'name' ? order : 'asc'}
									onClick={() => handleRequestSort('name')}
									className="font-bold"
								>
									Name
								</TableSortLabel>
							</TableCell>
							<TableCell>
								<TableSortLabel
									active={orderBy === 'id'}
									direction={orderBy === 'id' ? order : 'asc'}
									onClick={() => handleRequestSort('id')}
									className="font-bold"
								>
									ID
								</TableSortLabel>
							</TableCell>
							<TableCell>
								<TableSortLabel
									active={orderBy === 'version'}
									direction={orderBy === 'version' ? order : 'asc'}
									onClick={() => handleRequestSort('version')}
									className="font-bold"
								>
									Version
								</TableSortLabel>
							</TableCell>
							<TableCell>
								<TableSortLabel
									active={orderBy === 'available'}
									direction={orderBy === 'available' ? order : 'asc'}
									onClick={() => handleRequestSort('available')}
									className="font-bold"
								>
									Available
								</TableSortLabel>
							</TableCell>
							<TableCell align="right" className="font-bold">Action</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{filteredAndSortedPackages.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" className="py-64">
									<Typography color="text.secondary italic">
										{searchText ? `No software found matching "${searchText}"` : 'No software details found.'}
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							filteredAndSortedPackages.map((pkg) => (
								<TableRow key={pkg.id} hover>
									<TableCell component="th" scope="row" className="font-medium py-12">
										{pkg.name}
									</TableCell>
									<TableCell className="text-xs text-text-secondary">{pkg.id}</TableCell>
									<TableCell>{pkg.version}</TableCell>
									<TableCell>
										{pkg.available && pkg.available !== pkg.version ? (
											<Typography color="secondary" className="font-bold">
												{pkg.available}
											</Typography>
										) : (
											<span className="text-text-disabled">{pkg.version}</span>
										)}
									</TableCell>
									<TableCell align="right">
										{pkg.available && pkg.available !== pkg.version && (
											<Button
												variant="contained"
												size="small"
												color="secondary"
												className="rounded-full px-16"
												onClick={() => handleUpgrade(pkg.id)}
												disabled={upgrading === pkg.id}
											>
												{upgrading === pkg.id ? 'Updating...' : 'Update'}
											</Button>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
}

export default WindowsUpdatesPage;
