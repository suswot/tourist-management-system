const rbacMiddleware = (req, res, next) => {
    const role = req.user?.role;
    const zone = req.user?.zone;

    if (!role) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    let matchQuery = {};

    switch (role) {
        case 'Zone_Manager':
            // Level 1: Locked to exactly 1 zone. No VIP access.
            matchQuery = { is_VIP: { $ne: true }, zone: zone || 'North' };
            break;
        case 'VIP_Liaison':
            // Level 2: National access ONLY for is_VIP: true.
            matchQuery = { is_VIP: true };
            break;
        case 'Regional_Admin':
            // Level 3: Regional Cluster Access. Includes multiple zones but no VIP.
            matchQuery = { is_VIP: { $ne: true } };
            if (zone && zone !== 'All') {
                // If zone is "North-East", filter by that specific region
                matchQuery.zone = zone;
            }
            break;
        case 'National_Admin':
            // Level 4: Strategic "God-View". Unrestricted access to all sectors + VIPs.
            if (zone && zone !== 'All') matchQuery.zone = zone;
            break;
        default:
            // Fail-safe: Maximum restriction
            matchQuery = { _id: null };
    }

    req.rbacQuery = matchQuery;
    next();
};

module.exports = rbacMiddleware;
