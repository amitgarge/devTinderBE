const adminAuth = (req, res, next) => {
    const token = "hhjd";
    const isAdminAuthorized = token === "xyz";

    if (!isAdminAuthorized) {
        return res.status(401).send("Unauthorized Access!");
    }
    next();
}

const userAuth = (req, res, next) => {
    const token = "abc";
    const isUserAuthorized = token === "abc";

    if (!isUserAuthorized) {
        return res.status(401).send("Unauthorized Access")
    }
    next();
}

module.exports = { adminAuth, userAuth };