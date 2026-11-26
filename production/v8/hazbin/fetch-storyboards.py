from pathlib import Path
import json,urllib.request,math,sys,re,hashlib,concurrent.futures
root=Path(__file__).parent/'references'
name=sys.argv[1];video=sys.argv[2]
url='https://www.youtube.com/watch?v='+video
page=urllib.request.urlopen(url,timeout=30).read().decode()
m=re.search(r'var ytInitialPlayerResponse\s*=\s*(\{.*?\});',page)
d=json.loads(m.group(1))
spec=d.get('storyboards',{}).get('playerStoryboardSpecRenderer',{}).get('spec')
if not spec:print(d.get('playabilityStatus'));sys.exit(1)
bits=spec.split('|');base=bits[0];lvl=len(bits)-2;p=bits[-1].split('#');width,height,count,cols,rows,interval=map(int,p[:6]);npat=p[6];sigh=p[7]
urls=[]
for i in range(math.ceil(count/(cols*rows))):
 u=base.replace('$L',str(lvl)).replace('$N',npat.replace('$M',str(i)))+'&sigh='+sigh
 urls.append(u)
def fetch(pair):
 i,u=pair;out=root/f'{name}-board-{i:02}.jpg';b=urllib.request.urlopen(u,timeout=30).read();out.write_bytes(b);return {'path':str(out.relative_to(root.parent)), 'url':u,'sha256':hashlib.sha256(b).hexdigest(),'index':i}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:boards=list(ex.map(fetch,enumerate(urls)))
meta={'watchUrl':url,'title':d.get('videoDetails',{}).get('title'),'author':d.get('videoDetails',{}).get('author'),'checkedAt':'2026-11-26','cellWidth':width,'cellHeight':height,'cellCount':count,'columns':cols,'rows':rows,'intervalMs':interval,'boards':boards}
(root/f'{name}-reference.json').write_text(json.dumps(meta,indent=2)+'\n');print(json.dumps({k:v for k,v in meta.items() if k!='boards'},indent=2));print('boards:',len(boards))
