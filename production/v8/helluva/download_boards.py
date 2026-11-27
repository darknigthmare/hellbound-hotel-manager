import urllib.request,json,pathlib,concurrent.futures,math
root=pathlib.Path(__file__).resolve().parent/'references'
requests=[]
for path in root.glob('*-metadata.json'):
 j=json.loads(path.read_text());spec=j['storyboards']['playerStoryboardSpecRenderer']['spec'].split('|');base=spec[0];level=3;parts=spec[level+1].split('#');w,h,n,c,r,ms=map(int,parts[:6]);name=parts[6];sig=parts[7];urls=[]
 for i in range(math.ceil(n/(c*r))):
  u=base.replace('$L',str(level)).replace('$N',name).replace('$M',str(i))+'&sigh='+sig
  p=root/(j['name']+f'-board-{i}.jpg');requests.append((p,u));urls.append({'path':str(p),'url':u,'board':i,'startSeconds':i*c*r*ms/1000,'cellWidth':w,'cellHeight':h,'columns':c,'rows':r,'intervalMs':ms})
 (root/(j['name']+'-boards.json')).write_text(json.dumps(urls,indent=2))
def get(t):
 p,u=t
 try:
  d=urllib.request.urlopen(u,timeout=30).read();p.write_bytes(d);return {'path':p.name,'bytes':len(d)}
 except Exception as e:return {'path':p.name,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for x in pool.map(get,requests): print(json.dumps(x))
