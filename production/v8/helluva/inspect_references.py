import urllib.request,json,re,concurrent.futures,pathlib
root=pathlib.Path(__file__).resolve().parent
videos={'ghosts':'5DV4IIKwqRI','harvest':'h2ZmVAdezF8','looloo':'kpnwRg268FQ','ozzies':'8zyGQquL8VM','spring':'RghsgkZKedg','apology':'tLD-OUkYtk4','fullmoon':'Fj9YRsV1pEw'}
def get(pair):
 name,vid=pair; url='https://www.youtube.com/watch?v='+vid
 try:
  s=urllib.request.urlopen(url,timeout=30).read().decode()
  m=re.search(r'(?:var )?ytInitialPlayerResponse\s*=\s*',s)
  if not m:return {'name':name,'url':url,'error':'no player response'}
  j=json.JSONDecoder().raw_decode(s[m.end():])[0]
  record={'name':name,'url':url,'title':j.get('videoDetails',{}).get('title'),'author':j.get('videoDetails',{}).get('author'),'playability':j.get('playabilityStatus'),'storyboards':j.get('storyboards',{})}
  (root/'references'/f'{name}-metadata.json').write_text(json.dumps(record,ensure_ascii=False,indent=2))
  return {'name':name,'title':record['title'],'playability':record['playability'].get('status'),'storyboards':record['storyboards']}
 except Exception as e:return {'name':name,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for r in pool.map(get,videos.items()):print(json.dumps(r,ensure_ascii=False))
