import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import wingetService, { WingetPackage } from 'src/app/services/wingetService';



function WindowsUpdatesPage() {
	const [packages, setPackages] = useState<WingetPackage[]>([]);
	const [loading, setLoading] = useState(true);
	const [upgrading, setUpgrading] = useState<string | null>(null);

	const fetchPackages = async () => {
		setLoading(true);
		const data = await wingetService.list();
		setPackages(data);
		setLoading(false);
	};

	useEffect(() => {
		fetchPackages();
	}, []);

	const handleUpgrade = async (id: string) => {
		setUpgrading(id);
		const result = await wingetService.upgrade(id);
		if (result.success) {
			// Refresh list after upgrade
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

		<div className="m-4">
			<TableContainer component={Paper} className="rounded-xl shadow-sm border-1 border-solid">
				<div className="p-1 sm:p-2 flex justify-end">
					<Button
						variant="contained"
						color="secondary"
						onClick={fetchPackages}
						startIcon={<FuseSvgIcon>heroicons-outline:arrow-path</FuseSvgIcon>}
					>
						Refresh
					</Button>
				</div>
				<Table aria-label="winget software table">
					<TableHead>
						<TableRow>
							<TableCell className="font-bold">Name</TableCell>
							<TableCell className="font-bold">ID</TableCell>
							<TableCell className="font-bold">Version</TableCell>
							<TableCell className="font-bold">Available</TableCell>
							<TableCell align="right" className="font-bold">Action</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{packages.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} align="center" className="py-48">
									<Typography color="text.secondary italic">No packages found or winget returned no data.</Typography>
								</TableCell>
							</TableRow>
						) : (
							packages.map((pkg) => (
								<TableRow key={pkg.id} hover>
									<TableCell component="th" scope="row" className="font-medium">
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
