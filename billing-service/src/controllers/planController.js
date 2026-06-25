const planService = require("../services/planService");
const planRepository = require("../repository/planRepository");

const createPlan = async (req, res) => {
    try {
        const { name, price, currency, interval } = req.body;
        if (!name || !price) {
            return res.status(400).json({ error: "Missing required fields: name, price" });
        }

        const plan = await planService.createNewPlan({ name, price, currency, interval });
        res.status(201).json({ message: "Plan created successfully", data: plan });
    } catch (error) {
        res.status(500).json({ error: "Failed to create plan", details: error.message });
    }
};

const getPlans = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filter = {};
        if (req.query.name) {
            filter.name = { $regex: req.query.name, $options: "i" };
        }

        const result = await planRepository.getAllPlans(page, limit, filter);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch plans", details: error.message });
    }
};

module.exports = {
    createPlan,
    getPlans
};
