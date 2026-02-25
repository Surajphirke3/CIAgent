import asyncio
import sys

from app.routers.reports import generate_report
from app.database import users_col

async def run():
    user = await users_col.find_one({"email": "demo@ciagent.com"})
    if not user:
        print("Demo user not found!")
        return
        
    payload = {"template": "market_deep_dive", "competitor_ids": [], "sections": []}
    
    try:
        res = await generate_report(payload, current_user=user)
        print("Success!", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__=="__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.run(run())
