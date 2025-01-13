FROM python:3.11-slim
WORKDIR /app
COPY . /app/
COPY ./requirement.txt /app/
RUN pip install -r requirement.txt
CMD ["python", "app.py"]
