const rbacMiddleware = (req, res, next) => {
    const role = req.headers.role || req.query.role;
    const zone = req.headers.zone || req.query.zone;

    if (!role) {
        return res.status(403).json({ message: "Access Denied: Role identification missing" });
    }

    let matchQuery = {};

    switch (role) {
        case 'Zone_Manager':
            // Level 1: Assigned to 1 specific Zone. Cannot see VIP.
            matchQuery = { is_VIP: { $ne: true }, zone: zone || 'North' };
            break;
        case 'VIP_Liaison':
            // Level 2: National access ONLY for is_VIP: true.
            matchQuery = { is_VIP: true };
            break;
        case 'Regional_Admin':
            // Level 3: Oversees a cluster of Zones. No VIP.
            matchQuery = { is_VIP: { $ne: true } };
            if (zone && zone !== 'All') matchQuery.zone = zone;
            break;
        case 'National_Admin':
            // Level 4: Complete "God-View"
            if (zone && zone !== 'All') matchQuery.zone = zone;
            break;
        default:
            // Safety fallback
            matchQuery = { is_VIP: { $ne: true } };
    }

    req.rbacQuery = matchQuery;
    req.user = { role, zone };
    next();
};

module.exports = rbacMiddleware;
