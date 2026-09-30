#!/usr/bin/env python3
"""Static site generator for miguelluzes.github.io.

No external network access needed to build: Jinja2, Markdown and PyYAML
are the only dependencies, and they're standard, widely available packages
(pip installs them fine on GitHub Actions runners, which have normal internet
access, even though this local dev sandbox's egress is restricted to a small
allowlist that excludes package registries).

Usage: python3 scripts/build.py
Output: ./dist/
"""
import datetime as dt
import re
import shutil
import sys
from pathlib import Path
from xml.sax.saxutils import escape

import markdown as md
import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
TEMPLATES = ROOT / "templates"
STATIC = ROOT / "static"
DIST = ROOT / "dist"

MD = md.Markdown(extensions=["fenced_code", "tables", "codehilite", "attr_list", "sane_lists"],
                  extension_configs={"codehilite": {"guess_lang": False, "css_class": "codehilite"}})


def parse_frontmatter(text: str):
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.DOTALL)
    if not m:
        return {}, text
    fm = yaml.safe_load(m.group(1)) or {}
    return fm, m.group(2)


def render_md(text: str) -> str:
    MD.reset()
    return MD.convert(text)


def load_yaml(path: Path):
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def date_str(d) -> str:
    if isinstance(d, str):
        d = dt.date.fromisoformat(d)
    return d.strftime("%-d %b %Y") if sys.platform != "win32" else d.strftime("%d %b %Y").lstrip("0")


def collect(section: str, is_project: bool = False):
    items = []
    folder = CONTENT / section
    if not folder.exists():
        return items
    for f in sorted(folder.glob("*.md")):
        fm, body = parse_frontmatter(f.read_text(encoding="utf-8"))
        fm["slug"] = f.stem
        fm["content_html"] = render_md(body)
        if "date" in fm and fm["date"] is not None:
            d = fm["date"]
            if isinstance(d, str):
                d = dt.date.fromisoformat(d)
            fm["date"] = d
            fm["date_str"] = date_str(d)
        items.append(fm)
    return items


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    site_cfg = load_yaml(ROOT / "site.yaml")
    site = {
        "name": site_cfg["name"],
        "base_url": site_cfg["base_url"].rstrip("/"),
        "github": site_cfg["github"],
        "linkedin": site_cfg["linkedin"],
        "letterboxd": site_cfg.get("letterboxd", ""),
        "tagline": site_cfg["tagline"],
        "about": site_cfg["about"].strip(),
        "mission": site_cfg.get("mission", "").strip(),
        "stats": site_cfg.get("stats", []),
        "teaching": site_cfg.get("teaching", {}),
        "films": site_cfg.get("films", []),
    }
    year = dt.date.today().year

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES)),
        autoescape=select_autoescape(["html"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )

    # ---- Content ----
    projects = collect("projects")
    projects.sort(key=lambda p: p.get("order", 999))
    featured_projects = [p for p in projects if p.get("featured")]
    featured_projects.sort(key=lambda p: p.get("order", 999))

    blog_posts_all = collect("blog")
    blog_posts_all.sort(key=lambda p: p["date"], reverse=True)
    blog_posts = [p for p in blog_posts_all if not p.get("draft")]

    cv = load_yaml(CONTENT / "cv.yaml")

    uses_html = render_md((CONTENT / "uses.md").read_text(encoding="utf-8"))

    def write(path: str, template: str, **ctx):
        out = DIST / path.lstrip("/")
        out.mkdir(parents=True, exist_ok=True)
        html = env.get_template(template).render(site=site, year=year, path=path, **ctx)
        (out / "index.html").write_text(html, encoding="utf-8")

    # ---- Home ----
    latest_writing = []
    for p in blog_posts[:3]:
        latest_writing.append({"section": "blog", "slug": p["slug"], "title": p["title"],
                                "description": p["description"], "date_str": p["date_str"], "date": p["date"]})
    latest_writing.sort(key=lambda x: x["date"], reverse=True)
    latest_writing = latest_writing[:3]

    write("/", "index.html", title="Miguel Luzes · Data Analyst",
          description=site["tagline"], section="home",
          featured_projects=featured_projects,
          latest_writing=latest_writing,
          skill_categories=cv["skills"]["categories"],
          tools=cv["skills"]["tools"])

    # ---- Projects ----
    write("/projects/", "project_list.html", title="Projects · Miguel Luzes",
          description="Data pipelines, dashboards and models I've built.",
          section="projects", projects=projects)

    for p in projects:
        write(f"/projects/{p['slug']}/", "project_detail.html",
              title=f"{p['title']} · Miguel Luzes",
              description=p["summary"], section="projects",
              project=p, content=p["content_html"])

    # ---- CV ----
    write("/cv/", "cv.html", title="CV · Miguel Luzes",
          description="Miguel Luzes's CV: experience, projects, education and skills.",
          section="cv", cv=cv, projects=projects)

    # ---- Blog ----
    categories = sorted({p["category"] for p in blog_posts})
    write("/blog/", "blog_list.html", title="Blog · Miguel Luzes",
          description="Notes on books, training, films, football and data.",
          section="blog", posts=blog_posts, categories=categories, active_category=None)

    for cat in categories:
        write(f"/blog/category/{cat}/", "blog_list.html", title=f"{cat.capitalize()} · Blog · Miguel Luzes",
              description=f"Posts filed under {cat}.", section="blog",
              posts=[p for p in blog_posts if p["category"] == cat],
              categories=categories, active_category=cat)

    for p in blog_posts_all:
        write(f"/blog/{p['slug']}/", "post_detail.html", title=f"{p['title']} · Miguel Luzes",
              description=p["description"], section="blog",
              post=p, content=p["content_html"], back_href="blog", back_label="Blog")

    # ---- Uses ----
    write("/uses/", "uses.html", title="Uses · Miguel Luzes",
          description="The tools and stack Miguel works with.",
          section="uses", content=uses_html)

    # ---- 404 ----
    (DIST / "404.html").write_text(
        env.get_template("404.html").render(site=site, year=year, path="/404/", section=None,
                                             title="Not found · Miguel Luzes",
                                             description="Page not found."),
        encoding="utf-8")

    # ---- RSS ----
    rss_items = []
    for p in blog_posts:
        rss_items.append((p["title"], p["description"], f"{site['base_url']}/blog/{p['slug']}/", p["date"]))
    rss_items.sort(key=lambda x: x[3], reverse=True)

    rss_xml_items = "\n".join(
        f"""    <item>
      <title>{escape(title)}</title>
      <link>{escape(link)}</link>
      <guid>{escape(link)}</guid>
      <description>{escape(desc)}</description>
      <pubDate>{d.strftime('%a, %d %b %Y 00:00:00 GMT')}</pubDate>
    </item>""" for title, desc, link, d in rss_items
    )
    rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>{escape(site['name'])}</title>
    <link>{escape(site['base_url'])}/</link>
    <description>{escape(site['tagline'])}</description>
{rss_xml_items}
  </channel>
</rss>
"""
    (DIST / "rss.xml").write_text(rss, encoding="utf-8")

    # ---- Sitemap ----
    urls = ["/", "/projects/", "/cv/", "/blog/", "/uses/"]
    urls += [f"/projects/{p['slug']}/" for p in projects]
    urls += [f"/blog/{p['slug']}/" for p in blog_posts]
    sitemap_items = "\n".join(f"  <url><loc>{site['base_url']}{u}</loc></url>" for u in urls)
    sitemap = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{sitemap_items}\n</urlset>\n'
    (DIST / "sitemap.xml").write_text(sitemap, encoding="utf-8")

    # ---- robots.txt ----
    (DIST / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {site['base_url']}/sitemap.xml\n", encoding="utf-8")

    # ---- Static assets ----
    shutil.copytree(STATIC, DIST, dirs_exist_ok=True)
    # remove any leftover css folder issue not needed; copy done

    # ---- .nojekyll (GitHub Pages) ----
    (DIST / ".nojekyll").write_text("", encoding="utf-8")

    print(f"Built {len(projects)} projects, {len(blog_posts_all)} blog posts "
          f"({len(blog_posts)} published).")
    print(f"Output: {DIST}")


if __name__ == "__main__":
    main()
