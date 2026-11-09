// Minimal Jekyll-like dev server for preview (no Ruby needed)
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || __dirname); const PORT = +process.argv[3] || 4000;
const rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

function yamlList(t){const out=[];let cur=null;for(const line of t.split(/\r?\n/)){if(/^\s*#/.test(line)||!line.trim())continue;const m=line.match(/^(-\s+|\s+)(\w+):\s*"?(.*?)"?\s*$/);if(!m)continue;if(m[1].startsWith('-')){cur={};out.push(cur);}cur[m[2]]=m[3];}return out;}
function fm(t){const m=t.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);if(!m)return[{},t];const o={};for(const l of m[1].split(/\r?\n/)){const k=l.match(/^(\w+):\s*"?(.*?)"?\s*(#.*)?$/);if(k)o[k[1]]=k[2];}return[o,m[2]];}
function md(t){const inl=s=>s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2">$1</a>');
  return t.trim().split(/\r?\n\r?\n/).map(b=>{if(/^- /.test(b))return'<ul>'+b.split(/\r?\n/).map(l=>'<li>'+inl(l.replace(/^- /,''))+'</li>').join('')+'</ul>';if(/^> /.test(b))return'<blockquote>'+inl(b.replace(/^> /gm,''))+'</blockquote>';return'<p>'+inl(b)+'</p>';}).join('\n');}

function cfg(){const o={};for(const l of rd('_config.yml').split(/\r?\n/)){const k=l.match(/^(\w+):\s*"?(.*?)"?\s*(#.*)?$/);if(k)o[k[1]]=k[2];}return o;}
function load(){
  const site=cfg(); site.data={};
  for(const f of fs.readdirSync(path.join(ROOT,'_data'))) site.data[f.replace(/\.yml$/,'')]=yamlList(rd('_data/'+f));
  site.posts=fs.readdirSync(path.join(ROOT,'_posts')).filter(f=>f.endsWith('.md')).sort().reverse().map(f=>{
    const [meta,body]=fm(rd('_posts/'+f)); const d=f.slice(0,10); const slug=f.slice(11).replace(/\.md$/,'');
    const html=md(body); return {...meta,date:d,url:`/news/${d.slice(0,4)}/${d.slice(5,7)}/${slug}/`,content:html,excerpt:html.split('</p>')[0]};});
  return site;
}
const get=(c,e)=>e.trim().split('.').reduce((o,k)=>o?.[k],c);
function val(ctx,e){const parts=e.split('|').map(s=>s.trim());const q=parts[0].match(/^["'](.*)["']$/);let v=q?q[1]:get(ctx,parts[0]);
  for(const f of parts.slice(1)){const [n,a]=f.split(/:\s*/);const arg=a?.replace(/^["']|["']$/g,'');
    if(n==='relative_url')v=(ctx.site.baseurl||'')+v; else if(n==='default')v=v||(arg.startsWith('"')?arg:get(ctx,arg)??arg);
    else if(n==='slice')v=[...String(v)][0]; else if(n==='strip_html')v=String(v??'').replace(/<[^>]+>/g,'');
    else if(n==='truncate'){v=String(v);if(v.length>+arg)v=v.slice(0,+arg-3)+'...';}
    else if(n==='date')v=String(v).replace(/(\d+)-(\d+)-(\d+)/,'$1. $2. $3.');}
  return v??'';}
function cond(ctx,c){const m=c.match(/(.+?)\s*(!=|==)\s*(.+)/);if(!m)return!!val(ctx,c);const a=val(ctx,m[1]),b=val(ctx,m[3]);return m[2]==='=='?a==b:a!=b;}
function render(t,ctx){
  t=t.replace(/\{%\s*for (\w+) in ([\w.]+)(?: limit:(\d+))?\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/g,(_,v,arr,lim,body)=>{let a=get(ctx,arr)||[];if(lim)a=a.slice(0,+lim);return a.map(it=>render(body,{...ctx,[v]:it})).join('');});
  t=t.replace(/\{%\s*if (.+?)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g,(_,c,b)=>cond(ctx,c)?b:'');
  t=t.replace(/\{%\s*include ([\w.]+)\s*%\}/g,(_,f)=>render(rd('_includes/'+f),ctx));
  return t.replace(/\{\{\s*([^}]+?)\s*\}\}/g,(_,e)=>val(ctx,e));}
function layout(name,content,ctx){const [meta,body]=fm(rd(`_layouts/${name}.html`));const out=render(body.replace('{{ content }}','\u0000'),ctx).replace('\u0000',content);return meta.layout?layout(meta.layout,out,ctx):out;}
function page(file,site){const [meta,body]=fm(rd(file));const ctx={site,page:meta};return layout(meta.layout||'default',render(body,ctx),ctx);}

const types={'.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.gif':'image/gif'};
http.createServer((req,res)=>{
  try{const site=load();let u=decodeURIComponent(req.url.split('?')[0]);const bu=site.baseurl||'';if(bu&&u===bu){res.writeHead(302,{Location:bu+'/'});return res.end();}if(bu&&u.startsWith(bu+'/'))u=u.slice(bu.length);else if(bu&&u==='/'){res.writeHead(302,{Location:bu+'/'});return res.end();}let html=null;
    if(u==='/'||u==='/index.html')html=page('index.html',site);
    else if(u==='/news/'||u==='/news')html=page('news/index.html',site);
    else{const p=site.posts.find(p=>p.url===u||p.url===u+'/');if(p){const ctx={site,page:p};html=layout(p.layout||'post',p.content,ctx);}}
    if(html){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(html);}
    const fp=path.join(ROOT,u);if(fp.startsWith(ROOT)&&fs.existsSync(fp)&&fs.statSync(fp).isFile()){res.writeHead(200,{'Content-Type':types[path.extname(fp)]||'application/octet-stream'});return res.end(fs.readFileSync(fp));}
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('404 Not Found');
  }catch(e){res.writeHead(500);res.end(String(e.stack));}
}).listen(PORT,()=>console.log(`Serving http://localhost:${PORT}`));
