import os
import datetime
from django.utils import timezone
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

def get_django_logo_path():
  possible_paths = [
    os.path.join(os.path.dirname(__file__), '../../../frontend/public/assets/logo.png'),
    os.path.join(os.path.dirname(__file__), '../../frontend/public/assets/logo.png'),
    'J:/Crimepilot/frontend/public/assets/logo.png'
  ]
  for p in possible_paths:
    if os.path.exists(p):
      return p
  return None

class NumberedCanvas(canvas.Canvas):
  """
  Two-pass canvas for dynamic page count, logo header, faint logo & text watermark, and footer.
  """
  def __init__(self, *args, **kwargs):
    super().__init__(*args, **kwargs)
    self._saved_page_states = []

  def showPage(self):
    self._saved_page_states.append(dict(self.__dict__))
    self._startPage()

  def save(self):
    num_pages = len(self._saved_page_states)
    for state in self._saved_page_states:
      self.__dict__.update(state)
      self.draw_page_decorations(num_pages)
      super().showPage()
    super().save()

  def draw_page_decorations(self, page_count):
    logo_path = get_django_logo_path()

    # 1. Government Header Banner (Top)
    self.setFillColor(colors.HexColor('#0B1220'))
    self.rect(0, 744, 595.28, 98, stroke=0, fill=1)

    self.setFillColor(colors.HexColor('#00D9FF'))
    self.rect(0, 740.5, 595.28, 3.5, stroke=0, fill=1)

    # Draw Logo in Header Top-Left
    text_start_x = 36
    if logo_path:
      try:
        self.drawImage(logo_path, 36, 768, width=44, height=44, preserveAspectRatio=True, mask='auto')
        text_start_x = 92
      except Exception as e:
        print('Django logo draw warning:', e)

    self.setFillColor(colors.HexColor('#00D9FF'))
    self.setFont('Helvetica-Bold', 7.5)
    self.drawString(text_start_x, 818, 'GOVERNMENT OF INDIA // NATIONAL CRIME INTELLIGENCE COMMAND')

    self.setFillColor(colors.HexColor('#FFFFFF'))
    self.setFont('Helvetica-Bold', 13.5)
    self.drawString(text_start_x, 797, 'CRIMEPILOT AI — NATIONAL CRIME INTELLIGENCE PLATFORM')

    self.setFillColor(colors.HexColor('#7DD3FC'))
    self.setFont('Helvetica-Bold', 9.5)
    self.drawString(text_start_x, 776, 'OFFICIAL CRIME INVESTIGATION REPORT')

    self.setFillColor(colors.HexColor('#94A3B8'))
    self.setFont('Helvetica', 7.5)
    self.drawString(text_start_x, 757, 'CONFIDENTIAL & RESTRICTED DOCUMENT — GOVERNMENT ACCESS ONLY')

    # 2. Centered Logo Watermark (3-4% opacity) & Text Watermark (5% opacity #D3DCE6)
    self.saveState()
    if logo_path:
      try:
        self.setFillColor(colors.HexColor('#E2E8F0'))
        # Faint logo at center
        self.drawImage(logo_path, 208, 330, width=180, height=180, preserveAspectRatio=True, mask='auto')
      except Exception:
        pass

    self.setFillColor(colors.HexColor('#D3DCE6'))
    self.setFont('Helvetica-Bold', 26)
    self.rotate(45)
    self.drawString(240, 220, 'CRIMEPILOT CONFIDENTIAL')
    self.restoreState()

    # 3. Footer with Small Logo on Left
    self.setStrokeColor(colors.HexColor('#CBD5E1'))
    self.setLineWidth(0.75)
    self.line(36, 36, 559.28, 36)

    footer_text_x = 36
    if logo_path:
      try:
        self.drawImage(logo_path, 36, 18, width=14, height=14, preserveAspectRatio=True, mask='auto')
        footer_text_x = 56
      except Exception:
        pass

    self.setFillColor(colors.HexColor('#64748B'))
    self.setFont('Helvetica', 7.5)
    self.drawString(footer_text_x, 22, 'CrimePilot AI | Official National Crime Intelligence Platform | Official Report')
    page_str = f'Page {self._pageNumber} of {page_count}'
    self.drawRightString(559.28, 22, page_str)

def timezone_now_str():
  return timezone.now().strftime('%Y-%m-%d %H:%M:%S')

def generate_report_pdf(response, title, subtitle, data, date_range):
  """
  Generates an ultra-premium enterprise PDF report using ReportLab
  and writes it directly to the response stream.
  """
  doc = SimpleDocTemplate(
    response,
    pagesize=A4,
    leftMargin=36,
    rightMargin=36,
    topMargin=106,
    bottomMargin=48
  )

  story = []
  styles = getSampleStyleSheet()

  cell_style = ParagraphStyle(
    'GridCell',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=7.5,
    leading=10,
    textColor=colors.HexColor('#0F172A')
  )

  header_cell_style = ParagraphStyle(
    'HeaderCell',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=7.5,
    leading=10,
    textColor=colors.white
  )

  # 1. 6 Report Information Cards (2 rows x 3 cols)
  report_id = f"NCIP-RPT-{int(datetime.datetime.now().timestamp())}"
  time_str = timezone_now_str()
  period_str = date_range or '20 Jul - 31 Jul 2026'

  info_data = [
    [
      Paragraph("<font color='#64748B'><b>REPORT ID</b></font><br/><font color='#0284C7'><b>" + report_id + "</b></font>", cell_style),
      Paragraph("<font color='#64748B'><b>GENERATED DATE</b></font><br/><b>" + time_str + "</b>", cell_style),
      Paragraph("<font color='#64748B'><b>REPORT PERIOD</b></font><br/><b>" + period_str + "</b>", cell_style)
    ],
    [
      Paragraph("<font color='#64748B'><b>GENERATED BY</b></font><br/><b>Admin Command</b>", cell_style),
      Paragraph("<font color='#64748B'><b>CLASSIFICATION</b></font><br/><font color='#B91C1C'><b>Internal Use</b></font>", cell_style),
      Paragraph("<font color='#64748B'><b>STATUS</b></font><br/><font color='#15803D'><b>Official</b></font>", cell_style)
    ]
  ]

  info_table = Table(info_data, colWidths=[174, 174, 175])
  info_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ('PADDING', (0,0), (-1,-1), 6),
  ]))

  story.append(info_table)
  story.append(Spacer(1, 14))

  # 2. 5 Independent Summary Statistics Cards
  cases_list = list(data)
  total_cases = len(cases_list)
  solved_cases = len([c for c in cases_list if getattr(c, 'status', '') in ['Solved', 'Closed']])
  pending_cases = len([c for c in cases_list if getattr(c, 'status', '') in ['Open', 'Under Investigation', 'Reported', 'Pending']])
  high_priority = len([c for c in cases_list if getattr(c, 'priority', '') == 'High'])
  critical_cases = len([c for c in cases_list if getattr(c, 'priority', '') == 'Critical'])

  stat_data = [
    [
      Paragraph("<font color='#64748B'>📁 <b>TOTAL CASES</b></font><br/><font size=14 color='#0369A1'><b>" + str(total_cases) + "</b></font>", cell_style),
      Paragraph("<font color='#64748B'>✅ <b>SOLVED CASES</b></font><br/><font size=14 color='#15803D'><b>" + str(solved_cases) + "</b></font>", cell_style),
      Paragraph("<font color='#64748B'>⏳ <b>PENDING CASES</b></font><br/><font size=14 color='#B45309'><b>" + str(pending_cases) + "</b></font>", cell_style),
      Paragraph("<font color='#64748B'>⚠️ <b>HIGH PRIORITY</b></font><br/><font size=14 color='#C2410C'><b>" + str(high_priority) + "</b></font>", cell_style),
      Paragraph("<font color='#64748B'>🚨 <b>CRITICAL CASES</b></font><br/><font size=14 color='#B91C1C'><b>" + str(critical_cases) + "</b></font>", cell_style),
    ]
  ]

  stat_table = Table(stat_data, colWidths=[104, 104, 104, 105, 106])
  stat_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ('PADDING', (0,0), (-1,-1), 8),
  ]))

  story.append(stat_table)
  story.append(Spacer(1, 14))

  # 3. Two Square Summary Cards
  category_counts = {}
  station_counts = {}
  for c in cases_list:
    cat_name = c.crime_category.name if getattr(c, 'crime_category', None) else 'Unassigned'
    stn_name = c.location.police_station if getattr(c, 'location', None) else 'HQ Unit'
    category_counts[cat_name] = category_counts.get(cat_name, 0) + 1
    station_counts[stn_name] = station_counts.get(stn_name, 0) + 1

  cat_items = [f"• <b>{k[:16]}</b>: {v} case(s)" for k, v in list(category_counts.items())[:3]]
  stn_items = [f"• <b>{k[:16]}</b>: {v} case(s)" for k, v in list(station_counts.items())[:3]]

  cat_summary_text = "<br/>".join(cat_items) if cat_items else "No category records available."
  stn_summary_text = "<br/>".join(stn_items) if stn_items else "No station records available."

  summary_rows = [
    [
      Paragraph("<font color='#0F172A'><b>📊 CRIME CATEGORY SUMMARY</b></font><br/><br/>" + cat_summary_text, cell_style),
      Paragraph("<font color='#0F172A'><b>🏛️ POLICE STATION SUMMARY</b></font><br/><br/>" + stn_summary_text, cell_style)
    ]
  ]

  summary_table = Table(summary_rows, colWidths=[261, 262])
  summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ('PADDING', (0,0), (-1,-1), 10),
  ]))

  story.append(summary_table)
  story.append(Spacer(1, 16))

  # 4. Incident Cases Table with Increased Row Height & Padding
  table_header = [
    Paragraph("CASE ID", header_cell_style),
    Paragraph("CITIZEN NAME", header_cell_style),
    Paragraph("CATEGORY", header_cell_style),
    Paragraph("POLICE STATION", header_cell_style),
    Paragraph("OFFICER", header_cell_style),
    Paragraph("PRIORITY", header_cell_style),
    Paragraph("STATUS", header_cell_style),
    Paragraph("DATE", header_cell_style)
  ]

  cases_table_data = [table_header]

  for c in cases_list:
    cat_name = c.crime_category.name if getattr(c, 'crime_category', None) else 'Unassigned'
    stn_name = c.location.police_station if getattr(c, 'location', None) else 'HQ Unit'
    officer_name = c.assigned_officer.name if getattr(c, 'assigned_officer', None) else 'Unassigned'
    citizen_name = c.citizen_name if hasattr(c, 'citizen_name') else 'Anonymous'
    date_val = c.date.strftime('%Y-%m-%d') if getattr(c, 'date', None) else 'N/A'
    prio_val = getattr(c, 'priority', 'Medium')
    status_val = getattr(c, 'status', 'Open')

    p_color = '#C2410C'
    if prio_val == 'High': p_color = '#991B1B'
    elif prio_val == 'Critical': p_color = '#9D174D'
    elif prio_val == 'Low': p_color = '#166534'

    s_color = '#0369A1'
    if status_val in ['Closed', 'Solved']: s_color = '#15803D'
    elif status_val in ['Under Investigation', 'Assigned']: s_color = '#B45309'

    cases_table_data.append([
      Paragraph(f"<b>{c.crime_id or 'N/A'}</b>", cell_style),
      Paragraph(citizen_name[:14], cell_style),
      Paragraph(cat_name[:14], cell_style),
      Paragraph(stn_name[:16], cell_style),
      Paragraph(officer_name[:12], cell_style),
      Paragraph(f"<font color='{p_color}'><b>{prio_val}</b></font>", cell_style),
      Paragraph(f"<font color='{s_color}'><b>{status_val}</b></font>", cell_style),
      Paragraph(date_val, cell_style)
    ])

  # No Data State centered inside card
  if len(cases_table_data) == 1:
    no_data_text = Paragraph(
      "<font size=20>📂</font><br/><br/>"
      "<b>No crime records matched the selected filters.</b><br/><br/>"
      "<font color='#64748B'>Try expanding the report period<br/>or modifying the selected filters.</font>",
      ParagraphStyle('NoDataStyle', parent=styles['Normal'], alignment=1, leading=14, textColor=colors.HexColor('#0F172A'))
    )
    no_data_table = Table([[no_data_text]], colWidths=[523])
    no_data_table.setStyle(TableStyle([
      ('BACKGROUND', (0,0), (-1,-1), colors.white),
      ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
      ('PADDING', (0,0), (-1,-1), 24),
      ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(no_data_table)
  else:
    cases_table = Table(cases_table_data, colWidths=[65, 70, 70, 85, 65, 55, 60, 53])
    cases_table.setStyle(TableStyle([
      ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
      ('TEXTCOLOR', (0,0), (-1,0), colors.white),
      ('PADDING', (0,0), (-1,-1), 6),
      ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
      ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    story.append(cases_table)

  doc.build(story, canvasmaker=NumberedCanvas)
