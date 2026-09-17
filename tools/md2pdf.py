# Minimal dependency-free PDF writer for the C&W notebook.
# Base-14 fonts, WinAnsi, text flow, headings, rules, bullets, code blocks, tables.
import re, sys, zlib

# Standard Helvetica / Helvetica-Bold widths, ASCII 32..126 (units/1000)
HELV = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584]
HELVB = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584]

def w(ch, bold):
    o = ord(ch)
    if 32 <= o <= 126:
        return (HELVB if bold else HELV)[o-32]
    return 556 if bold else 500

SUB = {'—':'-','–':'-','’':"'",'‘':"'",'“':'"','”':'"',
       '…':'...','·':'-','→':'->','↓':'v','é':'e','→':'->'}
def clean(t):
    for k,v in SUB.items(): t = t.replace(k,v)
    t = t.replace('**','').replace('*','')
    return ''.join(c if 32 <= ord(c) <= 126 else '?' for c in t)
def esc(t):
    return t.replace('\\','\\\\').replace('(','\\(').replace(')','\\)')

def tw(t, size, bold):
    return sum(w(c,bold) for c in t)*size/1000.0

def wrap(t, size, bold, width):
    words, lines, cur = t.split(), [], ''
    for wd in words:
        trial = (cur+' '+wd).strip()
        if tw(trial,size,bold) <= width or not cur:
            cur = trial
        else:
            lines.append(cur); cur = wd
    if cur: lines.append(cur)
    return lines or ['']

PW, PH = 595.28, 841.89
ML, MR, MT, MB = 54, 54, 56, 56
CW = PW - ML - MR

class Doc:
    def __init__(self):
        self.pages=[]; self.ops=[]; self.y=PH-MT
    def newpage(self):
        if self.ops: self.pages.append(self.ops)
        self.ops=[]; self.y=PH-MT
    def need(self,h):
        if self.y-h < MB: self.newpage()
    def text(self,t,size,bold,x=None,gray=0):
        self.need(size*1.25)
        x = ML if x is None else x
        f='F2' if bold else 'F1'
        self.ops.append(f"BT /{f} {size} Tf {gray} g {x:.1f} {self.y-size:.1f} Td ({esc(t)}) Tj ET")
        self.y -= size*1.25
    def para(self,t,size=10,bold=False,indent=0,lead=1.34,gap=5,gray=0):
        for ln in wrap(t,size,bold,CW-indent):
            self.need(size*lead)
            f='F2' if bold else 'F1'
            self.ops.append(f"BT /{f} {size} Tf {gray} g {ML+indent:.1f} {self.y-size:.1f} Td ({esc(ln)}) Tj ET")
            self.y -= size*lead
        self.y -= gap
    def rule(self,gray=0.6,th=0.5,pad=7):
        self.need(pad*2)
        self.y -= pad
        self.ops.append(f"{gray} G {th} w {ML} {self.y:.1f} m {PW-MR} {self.y:.1f} l S")
        self.y -= pad
    def band(self,t,size=13):
        self.need(size*2.6)
        h=size*1.75
        self.ops.append(f"0 g {ML} {self.y-h+4:.1f} {CW:.1f} {h:.1f} re f")
        self.ops.append(f"BT /F2 {size} Tf 1 g {ML+7:.1f} {self.y-size-1:.1f} Td ({esc(t)}) Tj ET")
        self.y -= h+9
    def box(self,lines,size=9.2):
        # Measure first, then paint fill, then border, then text on top.
        wrapped=[]; tot=8.0
        for t,b in lines:
            ws=wrap(t,size,b,CW-26); wrapped.append((ws,b))
            tot += len(ws)*size*1.38 + 3
        tot += 5
        self.need(tot+10)
        top=self.y; bot=top-tot
        self.ops.append(f"0.93 g {ML:.1f} {bot:.1f} {CW:.1f} {tot:.1f} re f")
        self.ops.append(f"0 G 2.2 w {ML+1.1:.1f} {bot:.1f} m {ML+1.1:.1f} {top:.1f} l S")
        self.y = top - 8
        for ws,b in wrapped:
            f='F2' if b else 'F1'
            for ln in ws:
                self.ops.append(f"BT /{f} {size} Tf 0 g {ML+14:.1f} {self.y-size:.1f} Td ({esc(ln)}) Tj ET")
                self.y -= size*1.38
            self.y -= 3
        self.y = bot - 9

    def table(self,hdr,rows,size=8.0):
        ncol=len(hdr)
        colw=[CW/ncol]*ncol
        if ncol==7: colw=[CW*x for x in (0.13,0.15,0.16,0.18,0.16,0.14,0.08)]
        elif ncol==5: colw=[CW*x for x in (0.09,0.16,0.25,0.31,0.19)]
        elif ncol==2: colw=[CW*0.3,CW*0.7]
        elif ncol==3: colw=[CW*0.22,CW*0.4,CW*0.38]
        def rowh(cells,b):
            return max(len(wrap(c,size,b,colw[i]-8)) for i,c in enumerate(cells))*size*1.3+6
        hh=rowh(hdr,True); self.need(hh+30)
        self.ops.append(f"0 g {ML} {self.y-hh:.1f} {CW:.1f} {hh:.1f} re f")
        x=ML
        for i,c in enumerate(hdr):
            yy=self.y-size-3
            for ln in wrap(c,size,True,colw[i]-8):
                self.ops.append(f"BT /F2 {size} Tf 1 g {x+4:.1f} {yy:.1f} Td ({esc(ln)}) Tj ET"); yy-=size*1.3
            x+=colw[i]
        self.y-=hh
        for r in rows:
            h=rowh(r,False)
            if self.y-h < MB:
                self.newpage()
            x=ML
            for i,c in enumerate(r):
                yy=self.y-size-3
                for ln in wrap(c,size,False,colw[i]-8):
                    self.ops.append(f"BT /F1 {size} Tf 0 g {x+4:.1f} {yy:.1f} Td ({esc(ln)}) Tj ET"); yy-=size*1.3
                x+=colw[i]
            self.y-=h
            self.ops.append(f"0.75 G 0.4 w {ML} {self.y:.1f} m {PW-MR} {self.y:.1f} l S")
        self.y-=9
    def build(self):
        if self.ops: self.pages.append(self.ops)
        objs=[]; npg=len(self.pages)
        kids=' '.join(f"{4+i} 0 R" for i in range(npg))
        objs.append("<< /Type /Catalog /Pages 2 0 R >>")
        objs.append(f"<< /Type /Pages /Count {npg} /Kids [{kids}] >>")
        objs.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>")
        for i,ops in enumerate(self.pages):
            objs.append(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PW} {PH}] /Resources << /Font << /F1 3 0 R /F2 {4+npg} 0 R >> >> /Contents {4+npg+1+i} 0 R >>")
        objs.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>")
        streams=[]
        for ops in self.pages:
            s="\n".join(o for o in ops if o).encode('latin-1','replace')
            streams.append(s)
        out=bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
        offs=[]
        def add(num, body):
            offs.append(len(out))
            out.extend(f"{num} 0 obj\n".encode()); out.extend(body); out.extend(b"\nendobj\n")
        n=1
        for o in objs:
            add(n,o.encode('latin-1')); n+=1
        for s in streams:
            cs = zlib.compress(s, 9)
            add(n, f"<< /Length {len(cs)} /Filter /FlateDecode >>\nstream\n".encode()+cs+b"\nendstream"); n+=1
        xref=len(out)
        total=n
        out.extend(f"xref\n0 {total}\n0000000000 65535 f \n".encode())
        for o in offs:
            out.extend(f"{o:010d} 00000 n \n".encode())
        out.extend(f"trailer\n<< /Size {total} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode())
        return bytes(out)

# ---------- render markdown ----------
src=open(sys.argv[1],encoding='utf-8').read().split('\n')
d=Doc(); i=0; N=len(src); incode=False; codebuf=[]
first=True
while i<N:
    L=src[i]
    if L.startswith('```'):
        incode=not incode
        if not incode:
            d.need(len(codebuf)*10+12)
            top=d.y
            for c in codebuf:
                d.ops.append(f"BT /F1 8.5 Tf 0 g {ML+14:.1f} {d.y-8.5:.1f} Td ({esc(clean(c))}) Tj ET"); d.y-=11
            d.ops.append(f"0 G 2 w {ML:.1f} {d.y:.1f} m {ML:.1f} {top:.1f} l S")
            d.y-=8; codebuf=[]
        i+=1; continue
    if incode:
        codebuf.append(L); i+=1; continue
    if re.match(r'^\s*---\s*$',L): d.rule(); i+=1; continue
    m=re.match(r'^(#{1,6})\s+(.*)$',L)
    if m:
        lv=len(m.group(1)); t=clean(re.sub(r'\*\*','',m.group(2)))
        if lv==1:
            if not first: d.newpage()
            d.text(t,20,True); d.y-=6
        elif lv==2:
            d.need(60); d.band(t,12.5)
        elif lv==3: d.y-=3; d.text(t,12,True); d.y-=3
        else: d.text(t,10,True); d.y-=2
        first=False; i+=1; continue
    if L.strip().startswith('|') and i+1<N and re.match(r'^\s*\|[\s\-:|]+\|\s*$',src[i+1]):
        hdr=[clean(re.sub(r'\*\*','',c.strip())) for c in L.strip().strip('|').split('|')]
        i+=2; rows=[]
        while i<N and src[i].strip().startswith('|'):
            rows.append([clean(re.sub(r'\*\*','',c.strip())) for c in src[i].strip().strip('|').split('|')]); i+=1
        d.table(hdr,rows); continue
    if L.startswith('>'):
        buf=[]
        while i<N and src[i].startswith('>'):
            b=src[i].lstrip('>').strip()
            if b: buf.append(b)
            i+=1
        lines=[]
        for b in buf:
            mh=re.match(r'^(#{1,6})\s+(.*)$',b)
            if mh: lines.append((clean(re.sub(r'\*\*','',mh.group(2))),True))
            else:
                bold=b.startswith('**') and b.rstrip().endswith('**')
                lines.append((clean(re.sub(r'\*\*','',b)),bold))
        d.box(lines); continue
    mL=re.match(r'^\s*([-*]|\d+\.)\s+(.*)$',L)
    if mL:
        while i<N:
            mm=re.match(r'^\s*([-*]|\d+\.)\s+(.*)$',src[i])
            if not mm: break
            mark='-' if mm.group(1) in ('-','*') else mm.group(1)
            d.para(f"{mark}  "+clean(re.sub(r'\*\*','',mm.group(2))),9.6,False,indent=12,gap=1)
            i+=1
        d.y-=4; continue
    if not L.strip(): i+=1; continue
    buf=[]
    while i<N and src[i].strip() and not src[i].startswith(('#','>','|','```')) and not re.match(r'^\s*([-*]|\d+\.)\s+',src[i]) and not re.match(r'^\s*---\s*$',src[i]):
        buf.append(src[i].strip()); i+=1
    t=' '.join(buf)
    bold = t.startswith('**') and t.rstrip().endswith('**') and t.count('**')==2
    d.para(clean(re.sub(r'\*\*','',t)),10,bold)

open(sys.argv[2],'wb').write(d.build())
print("pages:",len(d.pages))
