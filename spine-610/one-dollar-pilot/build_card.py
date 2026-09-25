"""Builds THY-MONEY-PATH-CARD-001 (the $1 pilot item) with base-14 fonts so the file stays small."""
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
GOLD=colors.HexColor('#c9b58a'); CREAM=colors.HexColor('#f4ede0'); INK=colors.HexColor('#1c1a17')
k=ParagraphStyle('k',fontName='Helvetica',fontSize=7.5,textColor=colors.HexColor('#8a6d2f'),leading=10)
h1=ParagraphStyle('h1',fontName='Helvetica-Bold',fontSize=24,leading=28,textColor=INK,spaceAfter=6)
h2=ParagraphStyle('h2',fontName='Helvetica-Bold',fontSize=13,leading=16,textColor=colors.HexColor('#3b2f1c'),spaceBefore=12,spaceAfter=4)
b=ParagraphStyle('b',fontName='Helvetica',fontSize=10.5,leading=14.5,textColor=INK,spaceAfter=6)
s=ParagraphStyle('s',fontName='Helvetica',fontSize=8.3,leading=11,textColor=colors.HexColor('#555555'))
eq=ParagraphStyle('eq',fontName='Courier-Bold',fontSize=18,leading=22,alignment=1)
def box(t): 
    x=Table([[Paragraph(t,eq)]],colWidths=[504]); x.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),CREAM),('BOX',(0,0),(-1,-1),0.8,GOLD),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)])); return x
def tab(rows,w):
    c=ParagraphStyle('c',parent=b,spaceAfter=0,fontSize=9.8,leading=12.5)
    data=[[Paragraph(str(x),c) for x in r] for r in rows]
    t=Table(data,colWidths=w); t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),0.6,GOLD),('BACKGROUND',(0,0),(-1,0),CREAM),('VALIGN',(0,0),(-1,-1),'TOP')])); return t
E=[Paragraph('ERSATZREALITY × THYLORA · MONEY PATH CARD · EDITION 1',k),Spacer(1,4),
Paragraph('Where Does One Dollar Go?',h1),
Paragraph('Every sale has a path. Before anyone can promise a share to a creator, a helper, or a cause, the money has to get through the gates first. This card shows the path in one line, then walks a real one-dollar sale through it.',b),
box('N = P − F − T − D'),Spacer(1,6),
tab([['<b>Letter</b>','<b>Plain words</b>'],['P','Payment — what the buyer actually paid.'],['F','Fees — what the card processor keeps.'],['T','Taxes — sales tax collected for the government. It was never ours.'],['D','Delivery cost — what it costs to hand the buyer the thing.'],['N','Net — the distributable amount. The only money anyone can share.']],[60,444]),
Paragraph('Walk one dollar through it',h2),
tab([['<b>Step</b>','<b>Amount</b>','<b>Why</b>'],['P','$1.00','The price of this card.'],['F','− $0.33','2.9% of $1.00 is $0.029, plus a flat $0.30 per card sale. Rounded: $0.33.'],['T','− $0.00','Depends on where you live. If tax was added, it goes to your state, not to us.'],['D','− $0.00','A file costs almost nothing to hand over once the library exists. Running the library is not free — that cost sits in O on the back.'],['<b>N</b>','<b>$0.67</b>','What is left to share.']],[50,70,384]),
Spacer(1,8),
Paragraph('<b>The surprise:</b> on a one-dollar sale, the flat 30 cents takes almost a third. That is why small prices are hard, and why nobody should promise “every dollar goes to…” without showing this line first.',b),
Paragraph('Fee shown is the standard online card rate on the store’s current plan, as recorded on a real THYLORA order on 2026-09-16 ($1.99 sale, $0.36 fee). Rates can change; the equation does not.',s),
PageBreak(),
Paragraph('MONEY PATH CARD · THE BACK',k),
Paragraph('Then the second line: who shares N',h2),box('N = B + C + A + O + R'),Spacer(1,6),
tab([['<b>Letter</b>','<b>Who</b>','<b>Your % (write it in)</b>'],['B','Beneficiary — the person the sale is meant to help','______'],['C','Creator — whoever made the thing','______'],['A','Approved partner — a named, agreed helper organization','______'],['O','Operation — hosting, the library, the store, people’s time','______'],['R','Reserve — refunds, chargebacks, a bad month','______'],['','<b>Must add up to</b>','<b>100%</b>']],[50,324,130]),
Paragraph('Four questions to ask about any “proceeds go to…” offer',h2),
Paragraph('1. What is P, and what are F, T and D? If nobody can say, N is a guess.<br/>2. Who exactly is B — a named person or partner who agreed, or just a category?<br/>3. Is the split written down before the sale, or decided after?<br/>4. Where is the monthly report that shows it happened?',b),
Paragraph('Try it on something you sell',h2),
Paragraph('P = ________   F = ________   T = ________   D = ________   N = ________',b),Spacer(1,10),
Paragraph('This card is an educational worksheet. It is not tax, legal or accounting advice, and it does not describe any charity or donation program. THYLORA has not yet published splits for any product; the blanks are blank on purpose.<br/>Original ErsatzReality × THYLORA work. Your copy stays in your THYLORA library; downloading it again costs nothing and does not expire. Questions: ersatzrealityenterprise@gmail.com',s)]
def foot(c,d):
    c.setFont('Helvetica',7); c.setFillColor(colors.grey); c.drawString(54,24,'THY-MONEY-PATH-CARD-001 · Edition 1 · ErsatzReality × THYLORA · page %d of 2'%d.page)
SimpleDocTemplate('THYLORA-Money-Path-Card-001.pdf',pagesize=letter,leftMargin=54,rightMargin=54,topMargin=48,bottomMargin=48,
 title='Where Does One Dollar Go? - THYLORA Money Path Card',author='ErsatzReality Enterprise / THYLORA',subject='THY-MONEY-PATH-CARD-001').build(E,onFirstPage=foot,onLaterPages=foot)
