import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {SharedModule} from './shared.module';
import {DemoComponent} from '../components';

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(
            [
                {path: '', component: DemoComponent},
            ]
        )
    ],
    declarations: [
        DemoComponent
    ],
    exports: [
        DemoComponent,
    ]
})
export class LazyDemoModule { }
