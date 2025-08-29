// middleware/mockAuth.js

// Mock Users hardcoded
const mockUsers = {
  farmer: {
    _id: "64f1a2b3c4d5e6f7g8h9i0j1",
    name: "Sanothan P",
    roles: ["farmer", "buyer"],
    district: "NuwaraEliya",
    email: "sanothan.p@gmail.com",
    phone: "+94771234567"
  },
  buyer: {
    _id: "64f1a2b3c4d5e6f7g8h9i0j2",
    name: "Kamala Silva",
    roles: ["buyer"],
    district: "Colombo",
    email: "kamala.silva@example.com",
    phone: "+94771234568"
  },
  agent: {
    _id: "64f1a2b3c4d5e6f7g8h9i0j3",
    name: "Support Agent",
    roles: ["support-agent"],
    district: "Colombo",
    email: "support@agrimarket.lk",
    phone: "+94112345678"
  }
};

// Mock Authentication Middleware
export const mockAuth = (req, res, next) => {
  const mockUserType = req.headers["x-mock-user"] || "farmer";
  
  if (!mockUsers[mockUserType]) {
    return res.status(400).json({
      error: "Invalid mock user type",
      availableTypes: Object.keys(mockUsers)
    });
  }
  
  req.user = { ...mockUsers[mockUserType] };
  console.log(`Mock user authenticated: ${req.user.name} (${mockUserType})`);
  next();
};

// Role checking middleware functions
export const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const hasRole = requiredRoles.some(role => req.user.roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        error: "Insufficient permissions",
        required: requiredRoles,
        userRoles: req.user.roles
      });
    }
    
    next();
  };
};

// Convenience role checking functions
export const requireFarmer = requireRole(["farmer"]);
export const requireSupport = requireRole(["support-agent"]);
export const requireBuyer = requireRole(["buyer"]);
export const requireFarmerOrBuyer = requireRole(["farmer", "buyer"]);

export { mockUsers };

export default mockAuth;