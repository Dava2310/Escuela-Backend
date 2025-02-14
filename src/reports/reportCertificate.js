function createReport(doc, student, certificate, teacher, nombreCurso) {

    // Margin
    const distanceMargin = 18;

    doc
        .fillAndStroke('#0e8cc3')
        .lineWidth(20)
        .lineJoin('round')
        .rect(
            distanceMargin,
            distanceMargin,
            doc.page.width - distanceMargin * 2,
            doc.page.height - distanceMargin * 2,
        )
        .stroke();

    // Header
    const maxWidth = 140;
    const maxHeight = 70;

    doc.image('src/reports/logo.jpeg', doc.page.width / 2 - maxWidth / 2, 60, {
        fit: [maxWidth, maxHeight],
        align: 'center',
    });

    jumpLine(doc, 5)

    doc
        .font('src/reports/fonts/NotoSansJP-Light.otf')
        .fontSize(10)
        .fill('#021c27')
        .text('Academia de Formación de Oficios Profesionales y Artes, C.A', {
            align: 'center',
        });

    jumpLine(doc, 2)

    doc
        .font('src/reports/fonts/NotoSansJP-Light.otf')
        .fontSize(10)
        .fill('#021c27')
        .text('Otorga a', {
            align: 'center',
        });

    jumpLine(doc, 1)

    doc
        .font('src/reports/fonts/NotoSansJP-Bold.otf')
        .fontSize(24)
        .fill('#021c27')
        .text(student.usuario.nombre + " " + student.usuario.apellido, {
            align: 'center',
        });

    jumpLine(doc, 1)
    
    // Content
    doc
        .font('src/reports/fonts/NotoSansJP-Regular.otf')
        .fontSize(16)
        .fill('#021c27')
        .text(certificate.titulo, {
            align: 'center',
        });

    doc
        .font('src/reports/fonts/NotoSansJP-Bold.otf')
        .fontSize(24)
        .fill('#021c27')
        .text(nombreCurso, {
            align: 'center',
        });

    jumpLine(doc, 1)

    doc
        .font('src/reports/fonts/NotoSansJP-Light.otf')
        .fontSize(10)
        .fill('#021c27')
        .text(certificate.descripcion, {
            align: 'center',
            width: 800, // Limita el ancho del texto para que no se expanda tanto
        });


    jumpLine(doc, 9)

    doc.lineWidth(1);

    // Signatures
    const lineSize = 174;
    const signatureHeight = 390;

    doc.fillAndStroke('#021c27');
    doc.strokeOpacity(0.2);

    const startLine1 = 128;
    const endLine1 = 128 + lineSize;
    doc
        .moveTo(startLine1, signatureHeight)
        .lineTo(endLine1, signatureHeight)
        .stroke();

    const startLine2 = endLine1 + 32;
    const endLine2 = startLine2 + lineSize;
    doc
        .moveTo(startLine2, signatureHeight)
        .lineTo(endLine2, signatureHeight)
        .stroke();

    const startLine3 = endLine2 + 32;
    const endLine3 = startLine3 + lineSize;
    doc
        .moveTo(startLine3, signatureHeight)
        .lineTo(endLine3, signatureHeight)
        .stroke();

    doc
        .font('src/reports/fonts/NotoSansJP-Bold.otf')
        .fontSize(10)
        .fill('#021c27')
        .text(teacher.usuario.nombre + " " + teacher.usuario.apellido, startLine1, signatureHeight + 10, {
            columns: 1,
            columnGap: 0,
            height: 40,
            width: lineSize,
            align: 'center',
        });

    doc
        .font('src/reports/fonts/NotoSansJP-Light.otf')
        .fontSize(10)
        .fill('#021c27')
        .text('Profesor Asignado', startLine1, signatureHeight + 25, {
            columns: 1,
            columnGap: 0,
            height: 40,
            width: lineSize,
            align: 'center',
        });

    doc
        .font('src/reports/fonts/NotoSansJP-Bold.otf')
        .fontSize(8)
        .fill('#021c27')
        .text(student.usuario.nombre + " " + student.usuario.apellido, startLine2, signatureHeight + 10, {
            columns: 1,
            columnGap: 0,
            height: 40,
            width: lineSize,
            align: 'center',
        });

    doc
        .font('src/reports/fonts/NotoSansJP-Light.otf')
        .fontSize(10)
        .fill('#021c27')
        .text('Estudiante', startLine2, signatureHeight + 25, {
            columns: 1,
            columnGap: 0,
            height: 40,
            width: lineSize,
            align: 'center',
        });

    doc
        .font('src/reports/fonts/NotoSansJP-Bold.otf')
        .fontSize(10)
        .fill('#021c27')
        .text('José Rodríguez', startLine3, signatureHeight + 10, {
            columns: 1,
            columnGap: 0,
            height: 40,
            width: lineSize,
            align: 'center',
        });

    doc
        .font('src/reports/fonts/NotoSansJP-Light.otf')
        .fontSize(10)
        .fill('#021c27')
        .text('Director', startLine3, signatureHeight + 25, {
            columns: 1,
            columnGap: 0,
            height: 40,
            width: lineSize,
            align: 'center',
        });

    jumpLine(doc, 4);

    // Validation link
    const link =
        'https://validate-your-certificate.hello/validation-code-here';

    const linkWidth = doc.widthOfString(link);
    const linkHeight = doc.currentLineHeight();

    doc
        .underline(
            doc.page.width / 2 - linkWidth / 2,
            448,
            linkWidth,
            linkHeight,
            { color: '#021c27' },
        )
        .link(
            doc.page.width / 2 - linkWidth / 2,
            448,
            linkWidth,
            linkHeight,
            link,
        );

    doc
        .font('src/reports/fonts/NotoSansJP-Light.otf')
        .fontSize(10)
        .fill('#021c27')
        .text(
            link,
            doc.page.width / 2 - linkWidth / 2,
            448,
            linkWidth,
            linkHeight
        );

    // Footer
    const bottomHeight = doc.page.height - 100;

    doc.image('src/reports/qr.png', doc.page.width / 2 - 30, bottomHeight, {
        fit: [60, 60],
    });

}

/**
 * Dibuja una línea de puntos horizontal en un documento PDF.
 * 
 * @param {object} doc - El objeto del documento PDF.
 * @param {number} startX - La coordenada X de inicio de la línea.
 * @param {number} endX - La coordenada X de fin de la línea.
 * @param {number} y - La coordenada Y donde se dibuja la línea.
 * @param {number} [dotSize=1] - El tamaño de cada punto.
 * @param {number} [gapSize=2] - El tamaño del espacio entre cada punto.
 */
function drawDottedLine(doc, startX, endX, y, dotSize = 1, gapSize = 2) {
    const totalDistance = endX - startX;
    const numDots = Math.floor(totalDistance / (dotSize + gapSize));

    for (let i = 0; i <= numDots; i++) {
        const currentX = startX + i * (dotSize + gapSize);
        doc.circle(currentX, y, dotSize).fill();
    }
}

// Helper to move to next line
function jumpLine(doc, lines) {
    for (let index = 0; index < lines; index++) {
        doc.moveDown();
    }
}

export default createReport;