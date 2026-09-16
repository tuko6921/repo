FROM python:3.12-alpine

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY zabbix_extract.py app.py board.py ./
COPY static /app/static

EXPOSE 8088

CMD ["python", "app.py"]