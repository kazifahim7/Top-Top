/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'API Not Found !!',
        error: '',
    });
};
export default notFound;
//# sourceMappingURL=notFound.js.map