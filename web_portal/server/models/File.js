import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const fileSchema = new Schema({
    collegeName: { type: String, required: true },
    program: { type: String, required: true },
    batch: { type: String, required: true },
    semester: { type: String, required: true },
    result_path: { type: Array, required: true },
}, {
    timestamps: true
});

export default model('File', fileSchema);