from flask import Flask, request, jsonify
import os
from analysis import analyze_marks  # Assuming your existing code is in analysis.py

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    # Get the file path from the request
    data = request.get_json()
    file_path = data.get('file_path')
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'File path is invalid or file does not exist'}), 400

    try:
        # Call the analyze_marks function and get both the result and generated files
        analysis_result, generated_files = analyze_marks(file_path)
        
        # Convert the result DataFrame to a dictionary for JSON response
        result_dict = analysis_result.to_dict(orient='records')
        
        return jsonify({
            'result': result_dict,
            'generated_files': generated_files
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 