from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from analysis import analyze_marks

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],  # Vite dev server
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"]
    }
})

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        print("data=>", data)
        file_path = request.json.get('file_path')
        print("file_path=>", file_path)
        shared_uploads_path = os.getenv('UPLOADS_PATH', '/shared/uploads')
        print("shared_uploads_path=>", shared_uploads_path)
       

        # Validate that the file exists in the shared directory
        
        full_path = os.path.join(shared_uploads_path, os.path.basename(file_path))
        print("reached here")
        if not os.path.exists(full_path):
            return jsonify({'error': f'File not found at: {full_path}'}), 404
        report_details = data.get('report_details')
        
        # Extract file details from report_details
        file_details = {
            'collegeName': report_details.get('collegeName'),
            'program': report_details.get('program'),
            'batch': report_details.get('batch'),
            'semester': report_details.get('semester'),
            'session': report_details.get('session')
        }
        
        # Validate required fields
        if not all(file_details.values()):
            return jsonify({'error': 'Missing required file details'}), 400

        if not file_path:
            return jsonify({'error': 'No file path provided'}), 400
        
        if not report_details:
            return jsonify({'error': 'No report details provided'}), 400

        if not os.path.exists(file_path):
            return jsonify({'error': f'File not found at path: {file_path}'}), 404

        # Pass both file_path and report_details to analyze_marks
        analysis_result, s3_urls = analyze_marks(file_path, report_details)
        
        return jsonify({
            'result': analysis_result.to_dict(orient='records'),
            'generated_files': s3_urls,
            'message': 'Analysis completed successfully'
        }), 200

    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        return jsonify({
            'error': 'Analysis failed',
            'details': str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)  # Explicitly set port to 5000 