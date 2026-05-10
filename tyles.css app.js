warning: in the working copy of 'styles.css', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/styles.css b/styles.css[m
[1mindex 759d3ed..4221f19 100644[m
[1m--- a/styles.css[m
[1m+++ b/styles.css[m
[36m@@ -54,42 +54,60 @@[m [mh2{margin:0 0 10px;font-size:26px}[m
   gap:14px;[m
   margin-top: 12px;[m
 }[m
[32m+[m
[32m+[m[32m/* === CARD === */[m
 .card{[m
   background: rgba(15,23,34,.72);[m
   border:1px solid rgba(35,48,71,.85);[m
   border-radius: var(--radius);[m
[31m-  padding:16px;[m
[32m+[m[32m  overflow: hidden;[m
   display:flex;[m
   flex-direction:column;[m
[31m-  min-height: 220px;[m
 }[m
 [m
[31m-/* Titolo card */[m
[31m-.card h3{margin:0 0 8px;font-size:18px}[m
[32m+[m[32m/* Immagine grande in cima */[m
[32m+[m[32m.card-img-wrap{[m
[32m+[m[32m  width: 100%;[m
[32m+[m[32m  height: 210px;[m
[32m+[m[32m  background: rgba(11,15,20,.45);[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  align-items: center;[m
[32m+[m[32m  justify-content: center;[m
[32m+[m[32m  overflow: hidden;[m
[32m+[m[32m}[m
[32m+[m[32m.card-img-wrap img{[m
[32m+[m[32m  width: 100%;[m
[32m+[m[32m  height: 100%;[m
[32m+[m[32m  object-fit: contain;[m
[32m+[m[32m  padding: 14px;[m
[32m+[m[32m}[m
 [m
[31m-/* ====== immagine + titolo in riga ====== */[m
[31m-.card-head{[m
[31m-  display:flex;[m
[31m-  gap:12px;[m
[31m-  align-items:center;[m
[31m-  margin:0 0 8px;[m
[31m-}[m
[31m-.card-head h3{[m
[31m-  margin:0;[m
[31m-  font-size:18px;[m
[31m-}[m
[31m-.card-img{[m
[31m-  width:56px;[m
[31m-  height:56px;[m
[31m-  border-radius:12px;[m
[31m-  object-fit:cover;[m
[31m-  flex:0 0 56px;[m
[31m-  background: rgba(11,15,20,.35);[m
[32m+[m[32m/* Corpo card */[m
[32m+[m[32m.card-body{[m
[32m+[m[32m  padding: 14px 16px 16px;[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  flex-direction: column;[m
[32m+[m[32m  flex: 1;[m
 }[m
[31m-/* ===================================== */[m
 [m
[32m+[m[32m/* Badge categoria */[m
[32m+[m[32m.card-cat{[m
[32m+[m[32m  display: inline-block;[m
[32m+[m[32m  font-size: 11px;[m
[32m+[m[32m  font-weight: 600;[m
[32m+[m[32m  text-transform: uppercase;[m
[32m+[m[32m  letter-spacing: .06em;[m
[32m+[m[32m  color: var(--muted);[m
[32m+[m[32m  background: rgba(35,48,71,.6);[m
[32m+[m[32m  border-radius: 6px;[m
[32m+[m[32m  padding: 2px 8px;[m
[32m+[m[32m  margin-bottom: 8px;[m
[32m+[m[32m  align-self: flex-start;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.card h3{margin:0 0 10px;font-size:15px;line-height:1.35}[m
 .card ul{margin:0 0 14px;padding-left:18px;color:var(--muted)}[m
[31m-.card li{margin:6px 0}[m
[32m+[m[32m.card li{margin:6px 0;font-size:13px}[m
 [m
 .btn{[m
   margin-top:auto;[m
[36m@@ -104,14 +122,12 @@[m [mh2{margin:0 0 10px;font-size:26px}[m
 }[m
 .btn:hover{border-color: rgba(168,179,196,.55)}[m
 [m
[31m-/* ====== AGGIUNTO: bottone disabilitato (quando manca ASIN) ====== */[m
 .btn.btn-disabled{[m
   opacity: .55;[m
   cursor: not-allowed;[m
   pointer-events: none;[m
   border-color: rgba(35,48,71,.9);[m
 }[m
[31m-/* ================================================================= */[m
 [m
 .meta{color:var(--muted);font-size:12px;margin-top:10px}[m
 .faq{[m
[36m@@ -131,6 +147,9 @@[m [mh2{margin:0 0 10px;font-size:26px}[m
   color:var(--muted);[m
 }[m
 @media (max-width: 900px){[m
[31m-  .grid{grid-template-columns: 1fr}[m
[32m+[m[32m  .grid{grid-template-columns: 1fr 1fr}[m
   h1{font-size:34px}[m
 }[m
[32m+[m[32m@media (max-width: 600px){[m
[32m+[m[32m  .grid{grid-template-columns: 1fr}[m
[32m+[m[32m}[m
