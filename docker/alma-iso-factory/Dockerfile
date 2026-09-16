FROM almalinux:9

RUN dnf install -y \
    python3 \
    python3-pip \
    lorax \
    pykickstart \
    xorriso \
    syslinux \
    && dnf clean all

RUN pip3 install --no-cache-dir \
    fastapi \
    uvicorn \
    jinja2 \
    python-multipart

WORKDIR /app
COPY . /app

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
