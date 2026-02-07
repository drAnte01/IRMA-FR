//components/dashboard/accountSummary.tsx

import style from "../../styles/components/accountSummary.module.css";

function AccountSummary() {
    return (
        <>
            <div className={style.accountSummary}>

                {/* Naziv restorana */}
                <h1 className={style.restaurantName}>Restaurant Name</h1>

                {/* Statistika po periodima */}
                <div className={style.periodicStats}>
                    <div className={style.statCard}>
                        <span className={style.label}>Today</span>
                        <span className={style.amount}>€ 0.00</span>
                    </div>

                    <div className={style.statCard}>
                        <span className={style.label}>This Week</span>
                        <span className={style.amount}>€ 0.00</span>
                    </div>

                    <div className={style.statCard}>
                        <span className={style.label}>Last Month</span>
                        <span className={style.amount}>€ 0.00</span>
                    </div>
                </div>

            </div>
        </>
    )
}

export default AccountSummary;