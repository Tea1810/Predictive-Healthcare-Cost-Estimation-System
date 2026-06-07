import io
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

_PURPLE   = colors.HexColor('#6c63ff')
_DARK     = colors.HexColor('#0f172a')
_SLATE    = colors.HexColor('#64748b')
_LIGHT_BG = colors.HexColor('#f1f5f9')
_styles   = getSampleStyleSheet()


def _style(name, **kwargs):
    return ParagraphStyle(name, parent=_styles['Normal'], **kwargs)


def build_pdf(cost: float, contributions: dict, report: str, patient: dict, patient_name: str = "") -> io.BytesIO:
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=15 * mm,
        bottomMargin=20 * mm,
    )

    story = []

    # ── Header bar ──────────────────────────────────────────────────────────
    header_table = Table(
        [[
            Paragraph('Healthcare Cost Estimation Report',
                      _style('h-title', fontSize=18, fontName='Helvetica-Bold',
                             textColor=colors.white)),
            Paragraph(date.today().strftime('%B %d, %Y'),
                      _style('h-date', fontSize=9, textColor=colors.white,
                             alignment=TA_RIGHT)),
        ]],
        colWidths=[120 * mm, 50 * mm],
    )
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), _PURPLE),
        ('TOPPADDING',    (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING',   (0, 0), (-1, -1), 14),
        ('RIGHTPADDING',  (0, 0), (-1, -1), 14),
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 7 * mm))

    # ── Patient summary line ─────────────────────────────────────────────────
    gender = 'Male' if patient.get('gender') == 0 else 'Female'
    smoker = 'Smoker' if patient.get('is_smoker') == 1 else 'Non-smoker'
    info = (
        f"Age: {patient.get('age')}  •  Gender: {gender}  "
        f"•  {smoker}  •  Conditions: {patient.get('num_diseases')}"
    )
    story.append(Paragraph(info, _style('p-info', fontSize=10, textColor=_SLATE)))
    story.append(Spacer(1, 5 * mm))

    # ── Estimated cost ───────────────────────────────────────────────────────
    story.append(Paragraph(
        'Estimated Annual Healthcare Cost',
        _style('cost-lbl', fontSize=11, fontName='Helvetica-Bold', textColor=_DARK),
    ))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph(
        f'${cost:,.2f}',
        _style('cost-val', fontSize=34, fontName='Helvetica-Bold', textColor=_PURPLE),
    ))
    story.append(Spacer(1, 7 * mm))
    story.append(HRFlowable(width='100%', thickness=1, color=_LIGHT_BG))
    story.append(Spacer(1, 6 * mm))

    # ── Cost drivers table ───────────────────────────────────────────────────
    story.append(Paragraph(
        'Key Cost Drivers',
        _style('sec-title', fontSize=12, fontName='Helvetica-Bold', textColor=_DARK),
    ))
    story.append(Spacer(1, 3 * mm))

    top = sorted(contributions.items(), key=lambda x: abs(x[1]), reverse=True)[:8]
    rows = [['Factor', 'Impact', 'Direction']]
    for name, pct in top:
        rows.append([name, f'{pct:+.1f}%', 'Increases cost' if pct > 0 else 'Reduces cost'])

    style_cmds = [
        ('BACKGROUND',    (0, 0), (-1, 0), _PURPLE),
        ('TEXTCOLOR',     (0, 0), (-1, 0), colors.white),
        ('FONTNAME',      (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE',      (0, 0), (-1, -1), 9),
        ('ALIGN',         (1, 0), (1, -1), 'CENTER'),
        ('GRID',          (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING',    (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING',   (0, 0), (-1, -1), 10),
        ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
    ]
    for i in range(1, len(rows)):
        if i % 2 == 0:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), _LIGHT_BG))

    t = Table(rows, colWidths=[90 * mm, 28 * mm, 52 * mm])
    t.setStyle(TableStyle(style_cmds))
    story.append(t)
    story.append(Spacer(1, 8 * mm))

    # ── AI-generated report ──────────────────────────────────────────────────
    story.append(Paragraph(
        'Personalised Summary',
        _style('sec-title2', fontSize=12, fontName='Helvetica-Bold', textColor=_DARK),
    ))
    story.append(Spacer(1, 3 * mm))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph(
        report.replace('\n', '<br/>'),
        _style('report-body', fontSize=10, textColor=colors.HexColor('#334155'), leading=16),
    ))
    story.append(Spacer(1, 12 * mm))

    # ── Footer ───────────────────────────────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=0.5, color=_LIGHT_BG))
    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph(
        'This report is generated by an AI model and is not a substitute for professional medical advice.',
        _style('footer', fontSize=8, textColor=_SLATE, alignment=TA_CENTER),
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer
