const catchAsync = require('./../starter/utils/catchAsync');
const AppError = require('./../starter/utils/appError');
const APIFeatures = require('./../starter/utils/apiFeatures');


exports.deleteOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('No Document Found with that ID', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true, //Updated document will be returned
            runValidators: true,
        });

        if (!doc) {
            return next(new AppError('No document Found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.createOne = Model =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;

        if (!doc) {
            return next(new AppError('No Document Found with that ID', 404));
        }
        //Tour.findOne({_id:req.params.id})
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });

exports.getAll = Model =>
    catchAsync(async (req, res, next) => {
        //To allow nested GET review on tour (hack)
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId }; //Not a JS Function just adding the Object in the variable filter and using it

        const features = new APIFeatures(Model.find(), req.query).filter().sort().limitFields().paginate();
        //EXECUTE QUERY
        // const doc = await features.query.explain();
        const doc = await features.query;

        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });
