更新：将原来的站点移到 site.html，并增加了一个简单的客户端密码门禁（index.html）。

说明：
- index.html 现在是一个极简的密码输入页，页面上仅显示一个密码框与确认按钮；通过校验后会跳转到 site.html。
- site.html 是你原来的页面内容（弹幕播放器等）。

注意（重要）：
- 这是基于前端的静态保护，无法防止有心人直接查看仓库或抓取 site.html 的内容。若要真正的访问控制，需要后端鉴权或在服务器端做保护（例如用 Cloudflare Access、Netlify Identity 或标准服务器中间件）。
- 我设置了一个简单的 MD5 校验（客户端），默认 HASH 是 md5("password")，请尽快修改 index.html 中的 PASSWORD_HASH 为你自己的密码的 MD5 值。

如果你需要，我可以：
- 为你把密码存放在更安全的地方（例如使用 Cloudflare Access 保护 GitHub Pages 站点或配置 Netlify/Cloudflare Workers 网关）；
- 或把站点部署到有真正访问控制的托管服务上并实现后端鉴权；
- 或把密码验证改为 Firebase Authentication / Supabase Auth 等方案。
