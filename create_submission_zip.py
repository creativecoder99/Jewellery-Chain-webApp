import zipfile
import os

zip_filename = "submission.zip"
files_to_zip = ["TDD.docx", "deployment.md"]

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file in files_to_zip:
        if os.path.exists(file):
            zipf.write(file, arcname=file)
            print(f"Added {file} to {zip_filename}")
        else:
            print(f"Warning: {file} not found!")

print(f"Created {zip_filename} with size: {os.path.getsize(zip_filename)} bytes")

