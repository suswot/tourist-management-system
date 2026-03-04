const mongoose = require('mongoose');

const managerActionSchema = mongoose.Schema({
    managerId: {
        type: String,
        required: true,
        default: 'System_Admin'
    },
    actionType: {
        type: String,
        enum: ['Verify', 'Flag', 'Dispatch_Police', 'Resolve'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetModel: {
        type: String,
        enum: ['Tourist', 'Hotel'],
        required: true
    },
    details: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const ManagerAction = mongoose.model('ManagerAction', managerActionSchema);
module.exports = ManagerAction;
