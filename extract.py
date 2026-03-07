import PyPDF2
reader = PyPDF2.PdfReader('d:/minimole/mini_project/mini/supabase_database_documentation.pdf')
with open('d:/minimole/mini_project/mini/schema2.txt', 'w') as f:
    for page in reader.pages:
        f.write(page.extract_text())
