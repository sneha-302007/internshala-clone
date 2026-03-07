const plans = {
  FREE: {
    price: 0,
    maxApplications: 1,
  },
  BRONZE: {
    price: 10000,
    maxApplications: 3,
  },
  SILVER: {
    price: 30000,
    maxApplications: 5,
  },
  GOLD: {
    price: 100000,
    maxApplications: Infinity,
  },
};

module.exports = plans;
