import boto3
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# AWS credentials and configuration
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_KEY')
AWS_REGION = os.getenv('AWS_REGION')
BUCKET_NAME = os.getenv('BUCKET_NAME')

def get_s3_client():
    """Create and return an S3 client"""
    return boto3.client(
        's3',
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_REGION
    )

def upload_file_to_s3(file_path, report_details):
    """
    Upload a file to S3 with proper folder structure
    Returns the S3 URL of the uploaded file
    """
    try:
        s3_client = get_s3_client()
        
        # Get filename from path
        file_name = os.path.basename(file_path)
        
        # Create S3 path with folder structure
        # session/program/filename
        s3_path = f"{report_details['batch']}/{report_details['program']}/{report_details['semester']}/{file_name}"
        
        # Upload file
        s3_client.upload_file(file_path, BUCKET_NAME, s3_path)
        
        # Generate S3 URL
        s3_url = f"https://{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_path}"
        
        return s3_url
        
    except ClientError as e:
        print(f"Error uploading to S3: {str(e)}")
        raise e

def delete_local_file(file_path):
    """Delete local file after successful S3 upload"""
    try:
        os.remove(file_path)
    except Exception as e:
        print(f"Error deleting local file: {str(e)}") 