"""Static geometry reconstruction. No browser, DOM, interaction or game capture.
Run from any directory; asset/CSS paths resolve from this script inside the repo.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import argparse, re, json, hashlib, math
import numpy as np
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--archived-planter-candidate',type=Path,help='Optional local former master with a baked-in planter; omitted or missing files skip this historical comparison.')
args=parser.parse_args()
OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[2]
ASSETS=ROOT/'public/assets'
CSSFILE=ROOT/'src/styles/pentagram-arena.css'
CSS=CSSFILE.read_text()
STAGEFILE=ROOT/'src/lib/pentagram-stages.ts'
STAGES_TEXT=STAGEFILE.read_text()
STAGES=['spring-broken-beach','murder-family-house','cash-circus']
CASES=[('desktop',1200,520,1440,900),('portrait',330,300,390,844),('landscape',730,242,844,390)]
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
fonts={n:ImageFont.truetype(FONT,n) for n in [10,12,14,17]}
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def clamp(a,b,c):return max(a,min(b,c))
def bounds16(image):return image.getchannel('A').point(lambda a:255 if a>=16 else 0).getbbox()
def rounded(values):return [round(float(v),4) for v in values]
assert '--wave-art-width: min(calc(100cqw - 20px), calc(100cqh * 1672 / 941))' in CSS
assert '--wave-art-height: min(100cqh, calc((100cqw - 20px) * 941 / 1672))' in CSS
rules={}
for stage in STAGES:
 rules[stage]={}
 for layer,selector in [('middle','desk'),('near','near')]:
  pattern=r'\.arena-combat-stage\[data-stage="'+stage+r'"\] \.infernal-'+selector+r'-plane\s*\{([^{}]+)\}'
  body=re.findall(pattern,CSS)[-1]
  width=float(re.search(r'--wave-prop-width:\s*calc\(var\(--wave-art-width\)\s*\*\s*([.\d]+)\)',body)[1])
  bm=re.search(r'bottom:\s*calc\(var\(--wave-art-height\)\s*\*\s*([.\d]+)\s*-\s*var\(--wave-prop-width\)\s*\*\s*([.\d]+)\)',body)
  am=re.search(r'(left|right):\s*calc\(var\(--wave-art-side\)\s*\+\s*var\(--wave-art-width\)\s*\*\s*([.\d]+)(?:\s*-\s*var\(--wave-prop-width\)\s*\*\s*([.\d]+))?\)',body)
  assert bm and am,(stage,layer,body)
  rules[stage][layer]={'width_art_fraction':width,'bottom_art_height_fraction':float(bm[1]),'bottom_canvas_width_correction':float(bm[2]),'horizontal_side':am[1],'horizontal_art_fraction':float(am[2]),'horizontal_prop_width_subtraction':float(am[3] or 0),'source_declarations':body.strip(),'z_index':1}
# These are the verified READY source anchors used by the current code.
FIGHTERS=[{'id':'hb_vortex','x_percent':22,'facing':'right','ground_y':1268,'canvas_height':1310},{'id':'hb_glitz','x_percent':78,'facing':'left','ground_y':1301,'canvas_height':1380}]
def place(dst,im,x,y,w,h):
 iw,ih=max(1,round(w)),max(1,round(h));px,py=round(x),round(y)
 scaled=im.resize((iw,ih),Image.Resampling.LANCZOS)
 dst.alpha_composite(scaled,(px,py))
 bb=bounds16(scaled)
 return [px+bb[0],py+bb[1],px+bb[2],py+bb[3]] if bb else None
scenarios=[]
sourcefiles=[CSSFILE,STAGEFILE,ROOT/'src/styles/infernal-authored-poses.css',ROOT/'src/lib/infernal-pose-anchors.ts',ROOT/'src/lib/infernal-appearances.ts']
for stage in STAGES:
 stage_dir=ASSETS/'stages/helluva'/stage
 room_path=stage_dir/'room.webp';sourcefiles.append(room_path)
 room=Image.open(room_path).convert('RGB');assert room.size==(1672,941)
 section=STAGES_TEXT.split("id: '"+stage+"',",1)[1].split('soundtrack:',1)[0]
 floor=re.search(r"floor: '(#[0-9a-fA-F]{6})'",section)[1]
 for name,W,H,VW,VH in CASES:
  # W/H denote the assumed stage content box. Borders and exterior UI excluded.
  aw=min(W-20,H*1672/941);ah=min(H,(W-20)*941/1672);sx=(W-aw)/2;sy=H-ah
  room_box=[sx,sy,sx+aw,H]
  back_color=ImageEnhance.Brightness(Image.new('RGB',(1,1),floor)).enhance(.83).getpixel((0,0))
  canvas=Image.new('RGBA',(W,H),back_color)
  art=ImageEnhance.Brightness(room).enhance(.83).convert('RGBA')
  canvas.alpha_composite(art.resize((round(aw),round(ah)),Image.Resampling.LANCZOS),(round(sx),round(sy)))
  row={'stage_id':stage,'case':name,'assumed_stage_content_box':[W,H],'assumed_viewport':[VW,VH],'parallax_offset':0,'room_visible_bounds':rounded(room_box),'room_scale':aw/1672,'props':[],'fighters':[]}
  for layer in ['middle','near']:
   rule=rules[stage][layer];p=stage_dir/f'prop-{layer}.webp';sourcefiles.append(p);im=Image.open(p).convert('RGBA');bb=bounds16(im)
   w=rule['width_art_fraction']*aw;scale=w/im.width;h=im.height*scale
   horizontal=sx+rule['horizontal_art_fraction']*aw-rule['horizontal_prop_width_subtraction']*w
   x=horizontal if rule['horizontal_side']=='left' else W-horizontal-w
   bottom=rule['bottom_art_height_fraction']*ah-rule['bottom_canvas_width_correction']*w
   y=H-bottom-h
   visible=[x+bb[0]*scale,y+bb[1]*scale,x+bb[2]*scale,y+bb[3]*scale]
   raster=place(canvas,im,x,y,w,h)
   contained=visible[0]>=sx-1e-6 and visible[1]>=sy-1e-6 and visible[2]<=sx+aw+1e-6 and visible[3]<=H+1e-6
   raster_contained=raster[0]>=math.floor(sx) and raster[1]>=math.floor(sy) and raster[2]<=math.ceil(sx+aw) and raster[3]<=H
   row['props'].append({'layer':layer,'asset':str(p.relative_to(ROOT)),'source_canvas':list(im.size),'source_alpha16_bbox':list(bb),'css_image_box':rounded([x,y,x+w,y+h]),'css_bottom':round(bottom,6),'scale_uniform':round(scale,9),'visible_bounds_exact':rounded(visible),'visible_bounds_normalized_in_art':rounded([(visible[0]-sx)/aw,(visible[1]-sy)/ah,(visible[2]-sx)/aw,(visible[3]-sy)/ah]),'visible_bounds_raster':raster,'contained_exact':bool(contained),'contained_raster':bool(raster_contained),'z_index':1})
  # Save the unlabelled scenery in memory for the window diagnostic only.
  scenery=canvas.copy()
  for fighter in FIGHTERS:
   p=ASSETS/'sprites/individual'/f"{fighter['id']}-ready.webp";sourcefiles.append(p);im=Image.open(p).convert('RGBA');assert im.height==fighter['canvas_height'];bb=bounds16(im);assert bb[3]==fighter['ground_y']
   cw=clamp(168,.25*VW,310)
   if VW<=700:cw=clamp(124,.38*VW,190)
   if VH<=600 and VW>VH:cw=clamp(104,.20*VW,190)
   fw,fh=1.5*cw,cw
   scale=min(fw/im.width,fh/im.height);iw,ih=im.width*scale,im.height*scale
   ground=.91*H;offset=fh*(1-fighter['ground_y']/im.height)
   x=fighter['x_percent']/100*W-iw/2;y=ground-fh+(fh-ih)+offset
   if fighter['facing']=='left':im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
   oriented_bb=bounds16(im)
   visible=[x+oriented_bb[0]*scale,y+oriented_bb[1]*scale,x+oriented_bb[2]*scale,y+oriented_bb[3]*scale]
   raster=place(canvas,im,x,y,iw,ih)
   row['fighters'].append({'id':fighter['id'],'pose':'ready','position_percent':fighter['x_percent'],'facing':fighter['facing'],'native_canvas':list(im.size),'combatant_width':cw,'css_contain_frame':[fw,fh],'image_render_size':rounded([iw,ih]),'uniform_scale':scale,'ground_line_y':ground,'ground_correction_pixels':offset,'visible_bounds_exact':rounded(visible),'visible_bounds_raster':raster,'z_index':2})
  label=ImageDraw.Draw(canvas);label.rectangle((4,4,245,23),fill=(10,8,14,220));label.text((9,7),'STATIQUE / HORS NAVIGATEUR',font=fonts[12],fill='white')
  dest=OUT/f'{stage}-{name}-static.png';canvas.convert('RGB').save(dest)
  row['composition_file']=dest.name
  if stage=='murder-family-house':
   # Keep geometry native before enlarging this explicitly-labelled QA crop.
   crop=(round(sx+aw*.48),round(sy+ah*.49),round(sx+aw*.68),round(sy+ah*.69))
   im=scenery.crop(crop).convert('RGB');im.save(OUT/f'planter-{name}-static-detail.png');row['planter_detail_crop']=crop
  scenarios.append(row)
# Contact sheet: desktop downscaled only to fit; portrait remains native size.
contact=Image.new('RGB',(1836,1085),'#17131b');draw=ImageDraw.Draw(contact)
draw.text((16,9),'COMPOSITIONS STATIQUES / PAS DE NAVIGATEUR / POSITIONS 22% ET 78%',font=fonts[17],fill='white')
for col,stage in enumerate(STAGES):
 x=12+col*608;y=45;draw.text((x,y),stage,font=fonts[17],fill='#f3d49c');y+=27
 for name,W,H,VW,VH in CASES:
  im=Image.open(OUT/f'{stage}-{name}-static.png');s=min(590/W,1);im=im.resize((round(W*s),round(H*s)),Image.Resampling.LANCZOS)
  draw.text((x,y),f'{name} : arene {W}x{H}, viewport suppose {VW}x{VH}',font=fonts[12],fill='#cab9ce');y+=22;contact.paste(im,(x,y));y+=im.height+24
contact.save(OUT/'static-stage-contact-sheet.png')
# Window alignment detail at a common display width, explicitly a zoom.
detail=Image.new('RGB',(1500,550),'#17131b');draw=ImageDraw.Draw(detail);draw.text((16,10),'JARDINIERE / ZOOMS STATIQUES DU DECOR ASSEMBLE / PAS DE RENDU NAVIGATEUR',font=fonts[17],fill='white')
for col,(name,W,H,VW,VH) in enumerate(CASES):
 im=Image.open(OUT/f'planter-{name}-static-detail.png');sc=470/im.width;im=im.resize((470,round(im.height*sc)),Image.Resampling.NEAREST);x=15+col*500;draw.text((x,45),f'{name} - crop agrandi pour inspection',font=fonts[14],fill='#f3d49c');detail.paste(im,(x,74))
detail.save(OUT/'static-planter-alignment.png')
# Compare the runtime export with the versioned, flowerbox-free master.
final_path=ROOT/'art/infernal-versus/masters/stages/murder-family-house-room-wave-g.png'
sourcefiles.append(final_path)
runtime=np.asarray(Image.open(ASSETS/'stages/helluva/murder-family-house/room.webp').convert('RGB'),dtype=float)
final=np.asarray(Image.open(final_path).convert('RGB'),dtype=float)
roi=(slice(530,615),slice(845,1065));runtime_vs_final=float(np.abs(runtime[roi]-final[roi]).mean())
# The unpublished former candidate is not required to reproduce any composition.
runtime_vs_old=None
if args.archived_planter_candidate is not None and args.archived_planter_candidate.is_file():
 old=np.asarray(Image.open(args.archived_planter_candidate).convert('RGB'),dtype=float)
 runtime_vs_old=float(np.abs(runtime[roi]-old[roi]).mean())
context={'date':'2026-11-25','type':'static CSS and exported-asset reconstruction','browser_capture':False,'dom_measured':False,'source_css_sha256':sha(CSSFILE),'source_files':{str(p.relative_to(ROOT)):sha(p) for p in sorted(set(sourcefiles))},'assumptions':['Requested canvas sizes are the stage content box; no DOM width/height measurements.','Container query units are assumed supported. 100cqw=W and 100cqh=H.','The landscape requested raster height242px rounds62svh=241.8px for the assumed390px viewport.','Parallax offset0, positions22/78, READY poses, no costume.','Room brightness0.83 reproduced. Native image ratios preserved by uniform geometry scaling.','HUD, browser font metrics, outer border, CSS drop shadows, spectator layers, attack effects and animation transforms omitted.','Raster placement/resizing rounds subpixel values, so exact and raster alpha bounds are reported separately.'], 'geometry':{'art_width':'min(W-20,H*1672/941)','art_height':'min(H,(W-20)*941/1672)','art_left':'(W-art_width)/2','art_top':'H-art_height','image_height':'CSS width*native_height/native_width','visible_alpha_bbox':'image origin + source alpha16 bbox * uniform scale'},'rules':rules,'scenarios':scenarios,'summary':{'scenario_count':len(scenarios),'prop_boxes':sum(len(x['props']) for x in scenarios),'contained_exact':sum(a['contained_exact'] for x in scenarios for a in x['props']),'contained_raster':sum(a['contained_raster'] for x in scenarios for a in x['props'])},'planter_runtime_master_check':{'roi_native_pixels':[845,530,1065,615],'mean_abs_rgb_difference_to_selected_final':runtime_vs_final,'mean_abs_rgb_difference_to_archived_baked_planter':runtime_vs_old,'archived_baked_planter_comparison_performed':runtime_vs_old is not None,'runtime_is_closer_to_final_unpainted_master':runtime_vs_final<runtime_vs_old if runtime_vs_old is not None else None,'scope':'Pixel comparison of existing decoded exports only; no asset modified.'}}
(OUT/'static-stage-measurements.json').write_text(json.dumps(context,ensure_ascii=False,indent=2))
print(json.dumps(context['summary'],indent=2));print(json.dumps(context['planter_runtime_master_check'],indent=2))
for row in scenarios:
 print(row['stage_id'],row['case'],'room',row['room_visible_bounds'])
 for prop in row['props']:print(' ',prop['layer'],prop['visible_bounds_exact'],'in-art',prop['visible_bounds_normalized_in_art'],'contained',prop['contained_exact'],prop['contained_raster'])
assert sha(CSSFILE)==context['source_css_sha256'],'CSS changed during static QA; rerun needed.'
