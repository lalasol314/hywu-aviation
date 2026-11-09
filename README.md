# 한양여대 항공과 홍보 사이트 (GitHub Pages)

비용 0원으로 운영하는 Jekyll 기반 학과 홍보 사이트입니다.

## 내용 수정은 이 파일들만
| 바꾸고 싶은 것 | 파일 |
|---|---|
| 사이트 이름, 인스타·유튜브 링크 | `_config.yml` |
| 숫자 자랑(만족도 등) | `_data/stats.yml` |
| 교수진 | `_data/faculty.yml` |
| 교육과정 | `_data/tracks.yml` |
| 입시 일정 | `_data/schedule.yml` |
| FAQ | `_data/faq.yml` |
| 학과소식(블로그 글) | `_posts/YYYY-MM-DD-제목.md` 새 파일 추가 |

## 새 소식 글 쓰기
GitHub에서 `_posts` 폴더 → Add file → Create new file → 이름 `2026-12-01-new-post.md`:
```
---
title: "제목"
category: 취업   # 입시 / 인터뷰 / 행사 등
image: /assets/images/사진.jpg   # 선택
---
본문을 자유롭게 작성
```
사진은 `assets/images`에 업로드하세요. 저장하면 1~2분 뒤 자동 반영됩니다.
